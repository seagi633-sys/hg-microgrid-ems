import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { ALL_PERMISSION_KEYS, PERMISSION_GROUPS } from '../config/menuPermissions'
import { hashPassword } from '../utils/password'

const STORAGE_KEY = 'ems-auth-data'
const SESSION_KEY = 'ems-auth-session'

const DEFAULT_ADMIN = {
  id: 'admin',
  username: 'admin',
  passwordHash: 'e4ffbb56f9fe9c50f61447d9582fdfe6be8727a51adabcad7d7d5da49d49a978',
  displayName: '系統管理者',
  isAdmin: true,
  permissions: [...ALL_PERMISSION_KEYS]
}

function loadUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return [DEFAULT_ADMIN]
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return [DEFAULT_ADMIN]
    const hasAdmin = parsed.some((user) => user.username === 'admin')
    return hasAdmin ? parsed : [DEFAULT_ADMIN, ...parsed]
  } catch {
    return [DEFAULT_ADMIN]
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
}

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveSession(userId) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ userId }))
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY)
}

export const useAuthStore = defineStore('auth', () => {
  const users = ref([])
  const currentUserId = ref(null)
  const initialized = ref(false)

  const currentUser = computed(() =>
    users.value.find((user) => user.id === currentUserId.value) || null
  )

  const isLoggedIn = computed(() => Boolean(currentUser.value))

  const initialize = () => {
    users.value = loadUsers()
    saveUsers(users.value)
    const session = loadSession()
    if (session?.userId && users.value.some((user) => user.id === session.userId)) {
      currentUserId.value = session.userId
    }
    initialized.value = true
  }

  const hasPermission = (permissionKey) => {
    const user = currentUser.value
    if (!user) return false
    if (user.isAdmin) return true
    return user.permissions.includes(permissionKey)
  }

  const hasAnyPermission = (permissionKeys) =>
    permissionKeys.some((key) => hasPermission(key))

  const login = async (username, password) => {
    const normalized = username.trim()
    const user = users.value.find((entry) => entry.username === normalized)
    if (!user) {
      throw new Error('帳號或密碼錯誤')
    }

    const passwordHash = await hashPassword(password)
    if (passwordHash !== user.passwordHash) {
      throw new Error('帳號或密碼錯誤')
    }

    currentUserId.value = user.id
    saveSession(user.id)
    return user
  }

  const logout = () => {
    currentUserId.value = null
    clearSession()
  }

  const addUser = async ({ username, password, displayName }) => {
    const normalized = username.trim()
    if (!normalized) throw new Error('請輸入帳號')
    if (!password) throw new Error('請輸入密碼')
    if (users.value.some((user) => user.username === normalized)) {
      throw new Error('此帳號已存在')
    }

    const newUser = {
      id: `user-${Date.now()}`,
      username: normalized,
      passwordHash: await hashPassword(password),
      displayName: displayName?.trim() || normalized,
      isAdmin: false,
      permissions: ['system-overview']
    }

    users.value.push(newUser)
    saveUsers(users.value)
    return newUser
  }

  const deleteUser = (userId) => {
    const user = users.value.find((entry) => entry.id === userId)
    if (!user) throw new Error('找不到使用者')
    if (user.isAdmin || user.username === 'admin') {
      throw new Error('系統管理者帳號無法刪除')
    }
    if (user.id === currentUserId.value) {
      throw new Error('無法刪除目前登入中的帳號')
    }

    users.value = users.value.filter((entry) => entry.id !== userId)
    saveUsers(users.value)
  }

  const updateUserPassword = async (userId, password) => {
    if (!password) throw new Error('請輸入新密碼')
    const user = users.value.find((entry) => entry.id === userId)
    if (!user) throw new Error('找不到使用者')
    user.passwordHash = await hashPassword(password)
    saveUsers(users.value)
  }

  const updateUserPermissions = (userId, permissions) => {
    const user = users.value.find((entry) => entry.id === userId)
    if (!user) throw new Error('找不到使用者')
    if (user.isAdmin) throw new Error('系統管理者擁有全部權限，無需設定')

    user.permissions = ALL_PERMISSION_KEYS.filter((key) => permissions.includes(key))
    saveUsers(users.value)
  }

  const getFirstAllowedPath = () => {
    for (const group of PERMISSION_GROUPS) {
      for (const item of group.items) {
        if (hasPermission(item.key)) return item.path
      }
    }
    return '/login'
  }

  return {
    users,
    currentUser,
    currentUserId,
    initialized,
    isLoggedIn,
    initialize,
    hasPermission,
    hasAnyPermission,
    login,
    logout,
    addUser,
    deleteUser,
    updateUserPassword,
    updateUserPermissions,
    getFirstAllowedPath
  }
})
