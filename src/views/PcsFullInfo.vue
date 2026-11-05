<template>
  <div class="pcs-full-page">
    <SiteHeader />

    <el-card class="pcs-full-card">
      <template #header>
        <div class="pcs-full-header">
          <div>
            <div class="pcs-full-title">
              設備細部參數
              <span class="pcs-full-site-id">site_id: {{ selectedVppSiteId || '—' }}</span>
            </div>
            <div class="pcs-full-subtitle">
              PostgreSQL · BMS / PCS / ATS / MC / MPM / RCB / EMS / UPS / DG · 最新更新 {{ allLatestRecordedAt || '—' }}
            </div>
          </div>
          <div class="pcs-full-actions">
            <el-button :icon="Refresh" :loading="manualRefreshing" type="primary" plain @click="refreshAll">
              全部重新整理
            </el-button>
            <el-button :icon="Back" plain @click="goBack">
              返回儲能系統
            </el-button>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeDetailTab" class="device-detail-tabs">
        <el-tab-pane label="BMS" name="bms">
          <div class="pcs-full-status">
            <el-tag :type="hasAnyBmsValue ? 'success' : 'info'" effect="light">
              {{ hasAnyBmsValue ? '已取得 BMS 即時資料' : '尚無 BMS 即時資料' }}
            </el-tag>
          </div>

          <div class="pcs-panel-list">
            <section
              v-for="panel in bmsPanels"
              :key="`bms-panel-${panel.panelIndex}`"
              class="pcs-panel bms-panel"
              :class="{ 'is-minimized': panel.minimized }"
            >
              <div class="pcs-panel-header">
                <div>
                  <div class="pcs-panel-title">BMS-{{ panel.selectedUnit }}</div>
                  <div class="pcs-panel-subtitle">
                    區塊 {{ panel.panelIndex }} ·
                    最新更新 {{ panel.latestRecordedAt || '—' }}
                  </div>
                </div>
                <div class="pcs-panel-actions">
                  <el-select
                    :model-value="panel.selectedUnit"
                    class="pcs-panel-select"
                    size="small"
                    @change="(value) => setBmsPanelUnit(panel.panelIndex, value)"
                  >
                    <el-option
                      v-for="unit in bmsUnitOptions"
                      :key="unit.value"
                      :label="unit.label"
                      :value="unit.value"
                    />
                  </el-select>
                  <el-tag :type="panel.hasAnyValue ? 'success' : 'info'" effect="light">
                    {{ panel.hasAnyValue ? '已連線' : '尚無資料' }}
                  </el-tag>
                  <el-button size="small" plain @click="toggleBmsPanel(panel.panelIndex)">
                    {{ panel.minimized ? '展開' : '最小化' }}
                  </el-button>
                </div>
              </div>

              <el-alert
                v-if="panel.connectionError && !panel.minimized"
                :title="panel.connectionError"
                type="warning"
                show-icon
                :closable="false"
                class="pcs-full-alert"
              />

              <div
                v-show="!panel.minimized"
                v-loading="panel.loading"
                class="bms-detail-grid"
              >
                <div class="bms-detail-column bms-status-column">
                  <div class="pcs-column-header bms-status-header">
                    <span>電池狀態</span>
                  </div>
                  <div
                    v-for="row in panel.statusRows"
                    :key="row.pointId"
                    class="pcs-point-row"
                  >
                    <div class="bms-status-point">
                      <div class="pcs-point-id" :title="row.displayPointId">{{ row.displayPointId }}</div>
                      <div class="bms-status-raw-value">({{ formatStatusRawValue(row) }})</div>
                    </div>
                    <div
                      class="pcs-value bms-status-value"
                      :class="{ 'is-error': row.error, 'is-empty': !row.error && !row.hasValue, 'is-abnormal': row.isAbnormal, 'is-working-status': row.isWorkingStatus }"
                      :title="row.displayValue"
                    >
                      <ul v-if="row.statusItems.length" class="bms-status-list">
                        <li v-for="statusItem in row.statusItems" :key="statusItem">
                          {{ statusItem }}
                        </li>
                      </ul>
                      <template v-else>{{ row.displayValue }}</template>
                    </div>
                  </div>
                </div>

                <div class="bms-detail-column">
                  <div class="pcs-column-header">
                    <span>參數名稱</span>
                    <span>數值</span>
                  </div>
                  <div
                    v-for="row in panel.metricRows"
                    :key="row.pointId"
                    class="pcs-point-row"
                  >
                    <div class="pcs-point-id" :title="row.displayPointId">{{ row.displayPointId }}</div>
                    <div
                      class="pcs-value"
                      :class="{ 'is-error': row.error, 'is-empty': !row.error && !row.hasValue, 'is-abnormal': row.isAbnormal }"
                    >
                      {{ row.displayValue }}
                    </div>
                  </div>
                </div>

                <div class="bms-detail-column bms-index-column">
                  <div class="bms-index-header">
                    <span>最高/最低 Cell 參數</span>
                    <span>數值</span>
                    <span>Index</span>
                  </div>
                  <div
                    v-for="row in panel.indexRows"
                    :key="row.pointId"
                    class="bms-index-row"
                  >
                    <div class="pcs-point-id" :title="row.displayPointId">{{ row.displayPointId }}</div>
                    <div
                      class="pcs-value"
                      :class="{ 'is-error': row.error, 'is-empty': !row.error && !row.hasValue, 'is-abnormal': row.isAbnormal }"
                    >
                      {{ row.displayValue }}
                    </div>
                    <div class="bms-index-value">{{ row.indexText || '—' }}</div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </el-tab-pane>
        <el-tab-pane label="PCS" name="pcs">
          <div class="pcs-full-status">
            <el-tag :type="hasAnyPcsValue ? 'success' : 'info'" effect="light">
              {{ hasAnyPcsValue ? '已取得 PCS 即時資料' : '尚無 PCS 即時資料' }}
            </el-tag>
          </div>

          <div class="pcs-panel-list">
            <section
              v-for="panel in pcsPanels"
              :key="panel.panelIndex"
              class="pcs-panel"
              :class="{ 'is-minimized': panel.minimized }"
            >
              <div class="pcs-panel-header">
                <div>
                  <div class="pcs-panel-title">PCS-{{ panel.selectedUnit }}</div>
                  <div class="pcs-panel-subtitle">
                    區塊 {{ panel.panelIndex }} ·
                    最新更新 {{ panel.latestRecordedAt || '—' }}
                  </div>
                </div>
                <div class="pcs-panel-actions">
                  <el-select
                    :model-value="panel.selectedUnit"
                    class="pcs-panel-select"
                    size="small"
                    @change="(value) => setPcsPanelUnit(panel.panelIndex, value)"
                  >
                    <el-option
                      v-for="unit in pcsUnitOptions"
                      :key="unit.value"
                      :label="unit.label"
                      :value="unit.value"
                    />
                  </el-select>
                  <el-tag :type="panel.hasAnyValue ? 'success' : 'info'" effect="light">
                    {{ panel.hasAnyValue ? '已連線' : '尚無資料' }}
                  </el-tag>
                  <el-button size="small" plain @click="togglePcsPanel(panel.panelIndex)">
                    {{ panel.minimized ? '展開' : '最小化' }}
                  </el-button>
                </div>
              </div>

              <el-alert
                v-if="panel.connectionError && !panel.minimized"
                :title="panel.connectionError"
                type="warning"
                show-icon
                :closable="false"
                class="pcs-full-alert"
              />

              <div
                v-show="!panel.minimized"
                v-loading="panel.loading"
                class="pcs-point-grid"
              >
                <div
                  v-for="(column, columnIndex) in panel.pointColumns"
                  :key="`pcs-panel-${panel.panelIndex}-point-column-${columnIndex}`"
                  class="pcs-point-column"
                  :class="{ 'pcs-status-column': isPcsStatusColumn(column) }"
                >
                  <div
                    class="pcs-column-header"
                    :class="{ 'pcs-status-header': isPcsStatusColumn(column) }"
                  >
                    <template v-if="isPcsStatusColumn(column)">
                      <span>PCS狀態</span>
                    </template>
                    <template v-else>
                      <span>參數名稱</span>
                      <span>數值</span>
                    </template>
                  </div>
                  <div
                    v-for="row in column"
                    :key="row.pointId"
                    class="pcs-point-row"
                  >
                    <div class="pcs-point-id" :title="row.displayPointId">{{ row.displayPointId }}</div>
                    <div
                      class="pcs-value"
                      :class="{
                        'is-error': row.error,
                        'is-empty': !row.error && !row.hasValue,
                        'is-abnormal': row.isAbnormal,
                        'is-alarm-status': row.isAlarmStatus,
                        'is-alarm-normal': row.isAlarmNormal
                      }"
                      :title="row.displayValue"
                    >
                      <ul v-if="row.isAlarmPoint && row.statusItems.length" class="pcs-status-list">
                        <li
                          v-for="statusItem in row.statusItems"
                          :key="statusItem"
                          :class="{ 'is-normal-text': isNormalStatusText(statusItem) }"
                        >
                          {{ statusItem }}
                        </li>
                      </ul>
                      <template v-else>{{ row.displayValue }}</template>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </el-tab-pane>
        <el-tab-pane label="ATS" name="ats">
          <div class="pcs-full-status">
            <el-tag :type="hasAnyAtsValue ? 'success' : 'info'" effect="light">
              {{ hasAnyAtsValue ? '已取得 ATS 即時資料' : '尚無 ATS 即時資料' }}
            </el-tag>
          </div>

          <div class="pcs-panel-list">
            <section
              v-for="panel in atsPanels"
              :key="panel.deviceId"
              class="pcs-panel bms-panel"
              :class="{ 'is-minimized': panel.minimized }"
            >
              <div class="pcs-panel-header">
                <div>
                  <div class="pcs-panel-title">{{ panel.deviceId }}</div>
                  <div class="pcs-panel-subtitle">
                    {{ panel.label }} · 最新更新 {{ panel.latestRecordedAt || '—' }}
                  </div>
                </div>
                <div class="pcs-panel-actions">
                  <el-tag :type="panel.hasAnyValue ? 'success' : 'info'" effect="light">
                    {{ panel.hasAnyValue ? '已連線' : '尚無資料' }}
                  </el-tag>
                  <el-button size="small" plain @click="toggleAtsPanel(panel.deviceId)">
                    {{ panel.minimized ? '展開' : '最小化' }}
                  </el-button>
                </div>
              </div>

              <el-alert
                v-if="panel.connectionError && !panel.minimized"
                :title="panel.connectionError"
                type="warning"
                show-icon
                :closable="false"
                class="pcs-full-alert"
              />

              <div
                v-show="!panel.minimized"
                v-loading="panel.loading"
                class="ats-detail-grid"
              >
                <div class="bms-detail-column ats-status-panel">
                  <div class="pcs-column-header">
                    <span>參數名稱</span>
                    <span>數值</span>
                  </div>
                  <div
                    v-for="row in panel.statusRows"
                    :key="row.pointId"
                    class="pcs-point-row"
                  >
                    <div class="pcs-point-id" :title="row.displayPointId">{{ row.displayPointId }}</div>
                    <div
                      class="pcs-value"
                      :class="{
                        'is-error': row.error,
                        'is-empty': !row.error && !row.hasValue,
                        'is-abnormal': row.isAbnormal,
                        'is-working-status': row.isWorkingStatus || (row.isNormalZero && row.displayValue === 'No Error'),
                        'is-normal-zero': row.isNormalZero && row.displayValue === 'normal'
                      }"
                      :title="row.displayValue"
                    >
                      <ul
                        v-if="row.statusItems.length > 1"
                        class="bms-status-list"
                      >
                        <li v-for="statusItem in row.statusItems" :key="statusItem">
                          {{ statusItem }}
                        </li>
                      </ul>
                      <template v-else>{{ row.displayValue }}</template>
                    </div>
                  </div>
                </div>

                <div class="bms-detail-column ats-voltage-panel">
                  <div class="pcs-column-header">
                    <span>電壓參數</span>
                    <span>數值</span>
                  </div>
                  <div
                    v-for="row in panel.voltageRows"
                    :key="row.pointId"
                    class="pcs-point-row"
                  >
                    <div class="pcs-point-id" :title="row.displayPointId">{{ row.displayPointId }}</div>
                    <div
                      class="pcs-value"
                      :class="{
                        'is-error': row.error,
                        'is-empty': !row.error && !row.hasValue
                      }"
                      :title="row.displayValue"
                    >
                      {{ row.displayValue }}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </el-tab-pane>
        <el-tab-pane label="MC" name="mc">
          <div class="pcs-full-status">
            <el-tag :type="hasAnyMcValue ? 'success' : 'info'" effect="light">
              {{ hasAnyMcValue ? '已取得 MC 即時資料' : '尚無 MC 即時資料' }}
            </el-tag>
          </div>

          <div class="pcs-panel-list">
            <section class="pcs-panel bms-panel" :class="{ 'is-minimized': mcMinimized }">
              <div class="pcs-panel-header">
                <div>
                  <div class="pcs-panel-title">MC</div>
                  <div class="pcs-panel-subtitle">
                    MC_DG / MC_PV1 / MC_PV2 · 最新更新 {{ mcLatestRecordedAt || '—' }}
                  </div>
                </div>
                <div class="pcs-panel-actions">
                  <el-tag :type="hasAnyMcValue ? 'success' : 'info'" effect="light">
                    {{ hasAnyMcValue ? '已連線' : '尚無資料' }}
                  </el-tag>
                  <el-button size="small" plain @click="mcMinimized = !mcMinimized">
                    {{ mcMinimized ? '展開' : '最小化' }}
                  </el-button>
                </div>
              </div>

              <div v-show="!mcMinimized" class="mc-detail-grid">
                <div
                  v-for="panel in mcPanels"
                  :key="panel.deviceId"
                  v-loading="panel.loading"
                  class="bms-detail-column ats-status-panel mc-status-panel"
                >
                  <div class="mc-column-title">
                    <div class="mc-column-device">{{ panel.deviceId }}</div>
                    <div class="mc-column-meta">
                      {{ panel.label }} · {{ panel.latestRecordedAt || '—' }}
                    </div>
                  </div>

                  <el-alert
                    v-if="panel.connectionError"
                    :title="panel.connectionError"
                    type="warning"
                    show-icon
                    :closable="false"
                    class="pcs-full-alert"
                  />

                  <div class="pcs-column-header">
                    <span>參數名稱</span>
                    <span>數值</span>
                  </div>
                  <div
                    v-for="row in panel.statusRows"
                    :key="row.pointId"
                    class="pcs-point-row"
                  >
                    <div class="pcs-point-id" :title="row.displayPointId">{{ row.displayPointId }}</div>
                    <div
                      class="pcs-value"
                      :class="{
                        'is-error': row.error,
                        'is-empty': !row.error && !row.hasValue,
                        'is-working-status': row.isWorkingStatus,
                        'is-normal-zero': row.isMcInfoStatus
                      }"
                      :title="row.displayValue"
                    >
                      {{ row.displayValue }}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </el-tab-pane>
        <el-tab-pane label="MPM" name="mpm">
          <div class="pcs-full-status">
            <el-tag :type="hasAnyMpmValue ? 'success' : 'info'" effect="light">
              {{ hasAnyMpmValue ? '已取得 MPM 即時資料' : '尚無 MPM 即時資料' }}
            </el-tag>
          </div>

          <div class="pcs-panel-list">
            <section class="pcs-panel bms-panel" :class="{ 'is-minimized': mpmMinimized }">
              <div class="pcs-panel-header">
                <div>
                  <div class="pcs-panel-title">MPM</div>
                  <div class="pcs-panel-subtitle">
                    METER_GW / MPM1~4 / MPM_DRB(CHA·CHB) · 最新更新 {{ mpmLatestRecordedAt || '—' }}
                  </div>
                </div>
                <div class="pcs-panel-actions">
                  <el-tag :type="hasAnyMpmValue ? 'success' : 'info'" effect="light">
                    {{ hasAnyMpmValue ? '已連線' : '尚無資料' }}
                  </el-tag>
                  <el-button size="small" plain @click="mpmMinimized = !mpmMinimized">
                    {{ mpmMinimized ? '展開' : '最小化' }}
                  </el-button>
                </div>
              </div>

              <div v-show="!mpmMinimized" class="mpm-stack">
                <div class="mpm-layout">
                  <div
                    v-loading="meterGwPanel.loading"
                    class="bms-detail-column ats-status-panel mc-status-panel mpm-gateway-panel"
                  >
                    <div class="mc-column-title">
                      <div class="mc-column-device">{{ meterGwPanel.deviceId }}</div>
                      <div class="mc-column-meta">
                        {{ meterGwPanel.label }} · {{ meterGwPanel.latestRecordedAt || '—' }}
                      </div>
                    </div>

                    <el-alert
                      v-if="meterGwPanel.connectionError"
                      :title="meterGwPanel.connectionError"
                      type="warning"
                      show-icon
                      :closable="false"
                      class="pcs-full-alert"
                    />

                    <div class="pcs-column-header">
                      <span>裝置</span>
                      <span>狀態</span>
                    </div>
                    <template v-if="meterGwPanel.gatewayRows.length">
                      <div
                        v-for="row in meterGwPanel.gatewayRows"
                        :key="row.name"
                        class="pcs-point-row"
                      >
                        <div class="pcs-point-id" :title="row.name">{{ row.name }}</div>
                        <div
                          class="pcs-value"
                          :class="{
                            'is-working-status': row.isActive,
                            'is-normal-zero': !row.isActive
                          }"
                          :title="row.text"
                        >
                          {{ row.text }}
                        </div>
                      </div>
                    </template>
                    <div v-else class="pcs-point-row">
                      <div class="pcs-point-id">GATEWAY_COMM_STATUS</div>
                      <div
                        class="pcs-value"
                        :class="{ 'is-empty': !meterGwPanel.hasAnyValue, 'is-error': meterGwPanel.error }"
                      >
                        {{ meterGwPanel.displayValue || '—' }}
                      </div>
                    </div>
                  </div>

                  <div class="mpm-meter-grid">
                    <div
                      v-for="panel in mpmMeterPanels"
                      :key="panel.deviceId"
                      v-loading="panel.loading"
                      class="bms-detail-column ats-status-panel mc-status-panel"
                    >
                      <div class="mc-column-title">
                        <div class="mc-column-device">{{ panel.deviceId }}</div>
                        <div class="mc-column-meta">
                          {{ panel.label }} · {{ panel.latestRecordedAt || '—' }}
                        </div>
                      </div>

                      <el-alert
                        v-if="panel.connectionError"
                        :title="panel.connectionError"
                        type="warning"
                        show-icon
                        :closable="false"
                        class="pcs-full-alert"
                      />

                      <div class="pcs-column-header">
                        <span>參數名稱</span>
                        <span>數值</span>
                      </div>
                      <div
                        v-for="row in panel.statusRows"
                        :key="row.pointId"
                        class="pcs-point-row"
                      >
                        <div class="pcs-point-id" :title="row.displayPointId">{{ row.displayPointId }}</div>
                        <div
                          class="pcs-value"
                          :class="{
                            'is-error': row.error,
                            'is-empty': !row.error && !row.hasValue
                          }"
                          :title="row.displayValue"
                        >
                          {{ row.displayValue }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  v-loading="mpmDrbPanel.loading"
                  class="mpm-drb-section"
                >
                  <div class="mc-column-title mpm-drb-header">
                    <div class="mc-column-device">{{ mpmDrbPanel.deviceId }}</div>
                    <div class="mc-column-meta">
                      {{ mpmDrbPanel.label }} · CHA1~5 / CHB1~5 · {{ mpmDrbPanel.latestRecordedAt || '—' }}
                    </div>
                  </div>

                  <el-alert
                    v-if="mpmDrbPanel.connectionError"
                    :title="mpmDrbPanel.connectionError"
                    type="warning"
                    show-icon
                    :closable="false"
                    class="pcs-full-alert"
                  />

                  <div
                    v-for="group in mpmDrbPanel.groups"
                    :key="group.key"
                    class="mpm-drb-group"
                  >
                    <div class="mpm-drb-group-title">{{ group.label }}</div>
                    <div class="mpm-drb-grid">
                      <div
                        v-for="channel in group.channels"
                        :key="channel.channel"
                        class="bms-detail-column ats-status-panel mc-status-panel"
                      >
                        <div class="mc-column-title">
                          <div class="mc-column-device">{{ channel.channel }}</div>
                        </div>
                        <div class="pcs-column-header">
                          <span>參數名稱</span>
                          <span>數值</span>
                        </div>
                        <div
                          v-for="row in channel.statusRows"
                          :key="row.pointId"
                          class="pcs-point-row"
                        >
                          <div class="pcs-point-id" :title="row.displayPointId">{{ row.displayPointId }}</div>
                          <div
                            class="pcs-value"
                            :class="{
                              'is-error': row.error,
                              'is-empty': !row.error && !row.hasValue
                            }"
                            :title="row.displayValue"
                          >
                            {{ row.displayValue }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </el-tab-pane>
        <el-tab-pane label="RCB" name="rcb">
          <div class="pcs-full-status">
            <el-tag :type="hasAnyRcbValue ? 'success' : 'info'" effect="light">
              {{ hasAnyRcbValue ? '已取得 RCB 即時資料' : '尚無 RCB 即時資料' }}
            </el-tag>
          </div>

          <div class="pcs-panel-list">
            <section class="pcs-panel bms-panel" :class="{ 'is-minimized': rcbMinimized }">
              <div class="pcs-panel-header">
                <div>
                  <div class="pcs-panel-title">RCB</div>
                  <div class="pcs-panel-subtitle">
                    RCB_ACC / RCB_DG / RCB_MAIN / RELAY32 · 最新更新 {{ rcbLatestRecordedAt || '—' }}
                  </div>
                </div>
                <div class="pcs-panel-actions">
                  <el-tag :type="hasAnyRcbValue ? 'success' : 'info'" effect="light">
                    {{ hasAnyRcbValue ? '已連線' : '尚無資料' }}
                  </el-tag>
                  <el-button size="small" plain @click="rcbMinimized = !rcbMinimized">
                    {{ rcbMinimized ? '展開' : '最小化' }}
                  </el-button>
                </div>
              </div>

              <div v-show="!rcbMinimized" class="rcb-detail-grid">
                <div
                  v-for="panel in rcbPanels"
                  :key="panel.deviceId"
                  v-loading="panel.loading"
                  class="bms-detail-column ats-status-panel mc-status-panel"
                >
                  <div class="mc-column-title">
                    <div class="mc-column-device">{{ panel.deviceId }}</div>
                    <div class="mc-column-meta">
                      {{ panel.label }} · {{ panel.latestRecordedAt || '—' }}
                    </div>
                  </div>

                  <el-alert
                    v-if="panel.connectionError"
                    :title="panel.connectionError"
                    type="warning"
                    show-icon
                    :closable="false"
                    class="pcs-full-alert"
                  />

                  <div class="pcs-column-header">
                    <span>參數名稱</span>
                    <span>數值</span>
                  </div>
                  <div
                    v-for="row in panel.statusRows"
                    :key="row.pointId"
                    class="pcs-point-row"
                  >
                    <div class="pcs-point-id" :title="row.displayPointId">{{ row.displayPointId }}</div>
                    <div
                      class="pcs-value"
                      :class="{
                        'is-error': row.error,
                        'is-empty': !row.error && !row.hasValue,
                        'is-working-status': row.isWorkingStatus,
                        'is-normal-zero': row.isMcInfoStatus
                      }"
                      :title="row.displayValue"
                    >
                      {{ row.displayValue }}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </el-tab-pane>
        <el-tab-pane label="EMS" name="ems">
          <div class="pcs-full-status">
            <el-tag :type="hasAnyEmsValue ? 'success' : 'info'" effect="light">
              {{ hasAnyEmsValue ? '已取得 EMS 即時資料' : '尚無 EMS 即時資料' }}
            </el-tag>
          </div>

          <div class="pcs-panel-list">
            <section class="pcs-panel bms-panel" :class="{ 'is-minimized': emsMinimized }">
              <div class="pcs-panel-header">
                <div>
                  <div class="pcs-panel-title">EMS</div>
                  <div class="pcs-panel-subtitle">
                    EMS_GW · 最新更新 {{ emsLatestRecordedAt || '—' }}
                  </div>
                </div>
                <div class="pcs-panel-actions">
                  <el-tag :type="hasAnyEmsValue ? 'success' : 'info'" effect="light">
                    {{ hasAnyEmsValue ? '已連線' : '尚無資料' }}
                  </el-tag>
                  <el-button size="small" plain @click="emsMinimized = !emsMinimized">
                    {{ emsMinimized ? '展開' : '最小化' }}
                  </el-button>
                </div>
              </div>

              <el-alert
                v-if="emsPanel.connectionError && !emsMinimized"
                :title="emsPanel.connectionError"
                type="warning"
                show-icon
                :closable="false"
                class="pcs-full-alert"
              />

              <div
                v-show="!emsMinimized"
                v-loading="emsPanel.loading"
                class="rcb-detail-grid"
              >
                <div class="bms-detail-column ats-status-panel mc-status-panel">
                  <div class="pcs-column-header">
                    <span>參數名稱</span>
                    <span>數值</span>
                  </div>
                  <div
                    v-for="row in emsPanel.statusRows"
                    :key="row.pointId"
                    class="pcs-point-row"
                  >
                    <div class="pcs-point-id" :title="row.displayPointId">{{ row.displayPointId }}</div>
                    <div
                      class="pcs-value"
                      :class="{
                        'is-error': row.error,
                        'is-empty': !row.error && !row.hasValue,
                        'is-normal-zero': row.isMcInfoStatus
                      }"
                      :title="row.displayValue"
                    >
                      {{ row.displayValue }}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </el-tab-pane>
        <el-tab-pane label="UPS" name="ups">
          <div class="pcs-full-status">
            <el-tag :type="hasAnyUpsValue ? 'success' : 'info'" effect="light">
              {{ hasAnyUpsValue ? '已取得 UPS 即時資料' : '尚無 UPS 即時資料' }}
            </el-tag>
          </div>

          <div class="pcs-panel-list">
            <section class="pcs-panel bms-panel" :class="{ 'is-minimized': upsMinimized }">
              <div class="pcs-panel-header">
                <div>
                  <div class="pcs-panel-title">UPS</div>
                  <div class="pcs-panel-subtitle">
                    UPS1 / UPS2 · 最新更新 {{ upsLatestRecordedAt || '—' }}
                  </div>
                </div>
                <div class="pcs-panel-actions">
                  <el-tag :type="hasAnyUpsValue ? 'success' : 'info'" effect="light">
                    {{ hasAnyUpsValue ? '已連線' : '尚無資料' }}
                  </el-tag>
                  <el-button size="small" plain @click="upsMinimized = !upsMinimized">
                    {{ upsMinimized ? '展開' : '最小化' }}
                  </el-button>
                </div>
              </div>

              <div v-show="!upsMinimized" class="rcb-detail-grid">
                <div
                  v-for="panel in upsPanels"
                  :key="panel.deviceId"
                  v-loading="panel.loading"
                  class="bms-detail-column ats-status-panel mc-status-panel"
                >
                  <div class="mc-column-title">
                    <div class="mc-column-device">{{ panel.deviceId }}</div>
                    <div class="mc-column-meta">
                      {{ panel.label }} · {{ panel.latestRecordedAt || '—' }}
                    </div>
                  </div>

                  <el-alert
                    v-if="panel.connectionError"
                    :title="panel.connectionError"
                    type="warning"
                    show-icon
                    :closable="false"
                    class="pcs-full-alert"
                  />

                  <div class="pcs-column-header">
                    <span>參數名稱</span>
                    <span>數值</span>
                  </div>
                  <div
                    v-for="row in panel.statusRows"
                    :key="row.pointId"
                    class="pcs-point-row"
                  >
                    <div class="pcs-point-id" :title="row.displayPointId">{{ row.displayPointId }}</div>
                    <div
                      class="pcs-value"
                      :class="{
                        'is-error': row.error,
                        'is-empty': !row.error && !row.hasValue,
                        'is-abnormal': row.isAbnormal,
                        'is-normal-zero': row.isNormalZero
                      }"
                      :title="row.displayValue"
                    >
                      <ul
                        v-if="row.statusItems.length > 1"
                        class="bms-status-list"
                      >
                        <li v-for="statusItem in row.statusItems" :key="statusItem">
                          {{ statusItem }}
                        </li>
                      </ul>
                      <template v-else>{{ row.displayValue }}</template>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </el-tab-pane>
        <el-tab-pane label="DG" name="dg">
          <div class="pcs-full-status">
            <el-tag :type="hasAnyDgValue || hasAnyFg4010Value ? 'success' : 'info'" effect="light">
              {{ hasAnyDgValue || hasAnyFg4010Value ? '已取得 DG/FG4010 即時資料' : '尚無 DG/FG4010 即時資料' }}
            </el-tag>
          </div>

          <div class="pcs-panel-list">
            <section class="pcs-panel bms-panel" :class="{ 'is-minimized': dgMinimized }">
              <div class="pcs-panel-header">
                <div>
                  <div class="pcs-panel-title">DG</div>
                  <div class="pcs-panel-subtitle">
                    柴油發電機 · 最新更新 {{ dgLatestRecordedAt || '—' }}
                  </div>
                </div>
                <div class="pcs-panel-actions">
                  <el-tag :type="hasAnyDgValue ? 'success' : 'info'" effect="light">
                    {{ hasAnyDgValue ? '已連線' : '尚無資料' }}
                  </el-tag>
                  <el-button size="small" plain @click="dgMinimized = !dgMinimized">
                    {{ dgMinimized ? '展開' : '最小化' }}
                  </el-button>
                </div>
              </div>

              <el-alert
                v-if="dgPanel.connectionError && !dgMinimized"
                :title="dgPanel.connectionError"
                type="warning"
                show-icon
                :closable="false"
                class="pcs-full-alert"
              />

              <div
                v-show="!dgMinimized"
                v-loading="dgPanel.loading"
                class="dg-detail-grid"
              >
                <div class="bms-detail-column ats-status-panel mc-status-panel dg-status-panel">
                  <div class="pcs-column-header">
                    <span>狀態參數</span>
                    <span>狀態</span>
                  </div>
                  <div
                    v-for="row in dgPanel.statusRows"
                    :key="row.pointId"
                    class="pcs-point-row"
                  >
                    <div class="pcs-point-id" :title="row.displayPointId">{{ row.displayPointId }}</div>
                    <div
                      class="pcs-value"
                      :class="{
                        'is-error': row.error,
                        'is-empty': !row.error && !row.hasValue,
                        'is-normal-zero': !row.error && row.hasValue
                      }"
                      :title="row.displayValue"
                    >
                      <ul
                        v-if="row.statusItems.length"
                        class="bms-status-list"
                      >
                        <li v-for="statusItem in row.statusItems" :key="statusItem">
                          {{ statusItem }}
                        </li>
                      </ul>
                      <template v-else>{{ row.displayValue }}</template>
                    </div>
                  </div>
                </div>

                <div
                  v-for="(column, columnIndex) in dgPanel.pointColumns"
                  :key="`dg-column-${columnIndex}`"
                  class="bms-detail-column ats-status-panel mc-status-panel"
                >
                  <div class="pcs-column-header">
                    <span>參數名稱</span>
                    <span>數值</span>
                  </div>
                  <div
                    v-for="row in column"
                    :key="row.pointId"
                    class="pcs-point-row"
                  >
                    <div class="pcs-point-id" :title="row.displayPointId">{{ row.displayPointId }}</div>
                    <div
                      class="pcs-value"
                      :class="{
                        'is-error': row.error,
                        'is-empty': !row.error && !row.hasValue
                      }"
                      :title="row.displayValue"
                    >
                      {{ row.displayValue }}
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <section class="pcs-panel bms-panel" :class="{ 'is-minimized': fg4010Minimized }">
              <div class="pcs-panel-header">
                <div>
                  <div class="pcs-panel-title">FG4010</div>
                  <div class="pcs-panel-subtitle">
                    發電機控制器 · 最新更新 {{ fg4010LatestRecordedAt || '—' }}
                  </div>
                </div>
                <div class="pcs-panel-actions">
                  <el-tag :type="hasAnyFg4010Value ? 'success' : 'info'" effect="light">
                    {{ hasAnyFg4010Value ? '已連線' : '尚無資料' }}
                  </el-tag>
                  <el-button size="small" plain @click="fg4010Minimized = !fg4010Minimized">
                    {{ fg4010Minimized ? '展開' : '最小化' }}
                  </el-button>
                </div>
              </div>

              <el-alert
                v-if="fg4010Panel.connectionError && !fg4010Minimized"
                :title="fg4010Panel.connectionError"
                type="warning"
                show-icon
                :closable="false"
                class="pcs-full-alert"
              />

              <div
                v-show="!fg4010Minimized"
                v-loading="fg4010Panel.loading"
                class="dg-detail-grid"
              >
                <div
                  v-for="(column, columnIndex) in fg4010Panel.pointColumns"
                  :key="`fg4010-column-${columnIndex}`"
                  class="bms-detail-column ats-status-panel mc-status-panel"
                >
                  <div class="pcs-column-header">
                    <span>參數名稱</span>
                    <span>數值</span>
                  </div>
                  <div
                    v-for="row in column"
                    :key="row.pointId"
                    class="pcs-point-row"
                  >
                    <div class="pcs-point-id" :title="row.displayPointId">{{ row.displayPointId }}</div>
                    <div
                      class="pcs-value"
                      :class="{
                        'is-error': row.error,
                        'is-empty': !row.error && !row.hasValue
                      }"
                      :title="row.displayValue"
                    >
                      {{ row.displayValue }}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Back, Refresh } from '@element-plus/icons-vue'
import SiteHeader from '../components/SiteHeader.vue'
import { useEmsStore } from '../stores/emsStore'
import {
  useAtsDevicesRealtime,
  useBmsFullRealtime,
  useDgDevicesRealtime,
  useEmsDevicesRealtime,
  useFg4010DevicesRealtime,
  useMcDevicesRealtime,
  useMpmDevicesRealtime,
  usePcsFullRealtime,
  useRcbDevicesRealtime,
  useUpsDevicesRealtime
} from '../composables/useBmsRealtime'
import { ESS_CABINET_COUNT, MPM_DRB_CHANNEL_GROUPS, VPP_SITE_MAP } from '../config/vppSites'

const router = useRouter()
const emsStore = useEmsStore()
const selectedSiteId = computed(() => emsStore.selectedSiteId)
const selectedVppSiteId = computed(() => VPP_SITE_MAP[selectedSiteId.value] || null)

const activeDetailTab = ref('bms')
const manualRefreshing = ref(false)
const bmsLoadedPanels = ref({})
const bmsMinimizedPanels = ref({})
const pcsLoadedPanels = ref({})
const pcsMinimizedPanels = ref({})
const atsLoadedPanels = ref({})
const atsMinimizedPanels = ref({})
const mcLoadedPanels = ref({})
const mcMinimized = ref(false)
const rcbLoadedPanels = ref({})
const rcbMinimized = ref(false)
const mpmLoadedPanels = ref({})
const mpmMinimized = ref(false)
const emsLoadedPanels = ref({})
const emsMinimized = ref(false)
const fg4010LoadedPanels = ref({})
const fg4010Minimized = ref(false)
const upsLoadedPanels = ref({})
const upsMinimized = ref(false)
const dgLoadedPanels = ref({})
const dgMinimized = ref(false)

const atsRealtimeUnits = useAtsDevicesRealtime(selectedSiteId, undefined, 5000)
const mcRealtimeUnits = useMcDevicesRealtime(selectedSiteId, undefined, 5000)
const rcbRealtimeUnits = useRcbDevicesRealtime(selectedSiteId, undefined, 5000)
const mpmRealtimeUnits = useMpmDevicesRealtime(selectedSiteId, undefined, 5000)
const emsRealtimeUnits = useEmsDevicesRealtime(selectedSiteId, undefined, 5000)
const fg4010RealtimeUnits = useFg4010DevicesRealtime(selectedSiteId, undefined, 5000)
const upsRealtimeUnits = useUpsDevicesRealtime(selectedSiteId, undefined, 5000)
const dgRealtimeUnits = useDgDevicesRealtime(selectedSiteId, undefined, 5000)

const registerDeviceLoadedWatch = (units, loadedPanels) => {
  units.forEach((unit) => {
    watch(unit.loading, (isLoading) => {
      if (!isLoading) {
        loadedPanels.value = {
          ...loadedPanels.value,
          [unit.deviceId]: true
        }
      }
    })
  })
}

registerDeviceLoadedWatch(atsRealtimeUnits, atsLoadedPanels)
registerDeviceLoadedWatch(mcRealtimeUnits, mcLoadedPanels)
registerDeviceLoadedWatch(rcbRealtimeUnits, rcbLoadedPanels)
registerDeviceLoadedWatch(mpmRealtimeUnits, mpmLoadedPanels)
registerDeviceLoadedWatch(emsRealtimeUnits, emsLoadedPanels)
registerDeviceLoadedWatch(fg4010RealtimeUnits, fg4010LoadedPanels)
registerDeviceLoadedWatch(upsRealtimeUnits, upsLoadedPanels)
registerDeviceLoadedWatch(dgRealtimeUnits, dgLoadedPanels)

const hasAnyAtsValue = computed(() =>
  atsRealtimeUnits.some((unit) => unit.hasAnyValue.value)
)
const hasAnyMcValue = computed(() =>
  mcRealtimeUnits.some((unit) => unit.hasAnyValue.value)
)
const hasAnyRcbValue = computed(() =>
  rcbRealtimeUnits.some((unit) => unit.hasAnyValue.value)
)
const hasAnyMpmValue = computed(() =>
  mpmRealtimeUnits.some((unit) => unit.hasAnyValue.value)
)
const hasAnyEmsValue = computed(() =>
  emsRealtimeUnits.some((unit) => unit.hasAnyValue.value)
)
const hasAnyFg4010Value = computed(() =>
  fg4010RealtimeUnits.some((unit) => unit.hasAnyValue.value)
)
const hasAnyUpsValue = computed(() =>
  upsRealtimeUnits.some((unit) => unit.hasAnyValue.value)
)
const hasAnyDgValue = computed(() =>
  dgRealtimeUnits.some((unit) => unit.hasAnyValue.value)
)

const buildUnitOptions = (prefix) => Array.from({ length: ESS_CABINET_COUNT }, (_, index) => ({
  label: `${prefix}-${index + 1}`,
  value: index + 1
}))
const bmsUnitOptions = buildUnitOptions('BMS')
const pcsUnitOptions = buildUnitOptions('PCS')
const bmsPanelUnitRefs = Array.from({ length: ESS_CABINET_COUNT }, (_, index) => ref(index + 1))
const pcsPanelUnitRefs = Array.from({ length: ESS_CABINET_COUNT }, (_, index) => ref(index + 1))
const bmsRealtimeUnits = bmsPanelUnitRefs.map((unitIndexRef, index) => {
  const panelIndex = index + 1
  return {
    panelIndex,
    unitIndexRef,
    ...useBmsFullRealtime(selectedSiteId, unitIndexRef, 5000)
  }
})
const pcsRealtimeUnits = pcsPanelUnitRefs.map((unitIndexRef, index) => {
  const panelIndex = index + 1
  return {
    panelIndex,
    unitIndexRef,
    ...usePcsFullRealtime(selectedSiteId, unitIndexRef, 5000)
  }
})

const registerLoadedWatch = (units, loadedPanels) => {
  units.forEach((unit) => {
    watch(unit.loading, (isLoading) => {
      if (!isLoading) {
        loadedPanels.value = {
          ...loadedPanels.value,
          [unit.panelIndex]: true
        }
      }
    })
  })
}

registerLoadedWatch(bmsRealtimeUnits, bmsLoadedPanels)
registerLoadedWatch(pcsRealtimeUnits, pcsLoadedPanels)

const hasMetricValue = (item) => Number.isFinite(Number(item.value))
const isStatusPoint = (item) =>
  item.pointId?.includes('_STATUS')
  || item.pointId?.includes('_ERROR_TYPE')
  || item.pointId?.includes('_RETURN_TYPE')
  || item.pointId?.endsWith('_COS_AUTO')
const isMcPoint = (item) => /^MC_/.test(String(item.pointId || ''))
const isRcbPoint = (item) => /^(RCB_|RELAY32_)/.test(String(item.pointId || ''))
const isUpsPoint = (item) => /^UPS\d+_/.test(String(item.pointId || ''))
const isAlarmPoint = (item) => item.pointId?.includes('_ALARM_')
const isActivePowerControlEnable = (item) => item.pointId?.endsWith('_ACTIVE_POWER_CONTROL_ENABLE')
const isPowerCommand = (item) => item.pointId?.endsWith('_POWER_COMMAND')
const isPcsStatePoint = (item) =>
  isStatusPoint(item)
  || isAlarmPoint(item)
  || isActivePowerControlEnable(item)
  || isPowerCommand(item)
  || item.pointId?.endsWith('_RUN_STATE')
  || item.pointId?.endsWith('_GRID_MODE')
  || item.pointId?.endsWith('_GRID_MODE_COMMAND')
const isDecodedStatusPoint = (item) =>
  isPcsStatePoint(item)
  || isStatusPoint(item)
  || isMcPoint(item)
  || (isRcbPoint(item) && Boolean(item.decodedStatus))
const hasDisplayValue = (item) =>
  (isPcsStatePoint(item) || isStatusPoint(item) || isMcPoint(item) || isRcbPoint(item) || isUpsPoint(item))
    ? Boolean(item.decodedStatus) || hasMetricValue(item)
    : hasMetricValue(item) || Boolean(item.decodedStatus)
const isRacksErrorStatus = (item) => item.key === 'racksErrorStatus'
const isRacksWorkingStatus = (item) => item.key === 'racksWorkingStatus'
const isRacksCommErrorStatus = (item) => item.key === 'rackCommErrorStatus'
const isBmsNoErrorZeroStatus = (item) =>
  (isRacksErrorStatus(item) || isRacksCommErrorStatus(item))
  && hasMetricValue(item)
  && Number(item.value) === 0
const isRacksErrorAbnormal = (item) => {
  if (!isRacksErrorStatus(item)) return false
  // 0 / No Error → 藍色；非 0 異常 → 紅色
  if (!hasMetricValue(item)) return Boolean(item.decodedStatus) && !isNormalStatusText(item.decodedStatus)
  if (Number(item.value) === 0) return false
  return !isNormalStatusText(formatStatusText(item) || item.decodedStatus || '')
}
const isAtsErrorStatus = (item) =>
  item.key === 'main_power_error_type'
  || item.key === 'standby_power_error_type'
  || item.key === 'system_error_type'
  || item.statusKind === 'error'
const isAtsNetworkStatus = (item) =>
  item.key === 'network_status'
  || item.statusKind === 'network'
const isAtsPoint = (item) => /^ATS_/.test(String(item.pointId || ''))
const isAtsVoltagePoint = (item) =>
  isAtsPoint(item)
  && (item.statusKind === 'voltage' || String(item.pointId || '').includes('_VOLTAGE'))
const isAtsZeroValue = (item) =>
  isAtsPoint(item) && !isAtsVoltagePoint(item) && Number(item.value) === 0
const isZeroTextStatus = (item) =>
  Boolean(item.zeroText) && hasMetricValue(item) && Number(item.value) === 0
const isBitWarningAbnormal = (item) =>
  item.statusKind === 'warning' && hasMetricValue(item) && Number(item.value) !== 0

const ATS_CATEGORY_LABELS = {
  error: '異常類型',
  return: '復歸類型',
  network: '網路/投切狀態',
  other: '其他狀態',
  command: '遠端指令',
  voltage: '電壓'
}

const formatStatusText = (item) => {
  const text = item.decodedStatus || ''
  if (!isRacksWorkingStatus(item)) return text
  return text.replace(/\s*[（(][^）)]*[）)]/g, '')
}

const formatStatusRawValue = (item) => {
  if (!hasMetricValue(item)) return '—'
  const decimals = item.decimals ?? 0
  return Number(item.value).toFixed(decimals)
}

const formatFlexibleDecimalValue = (value, decimals) => {
  const num = Number(value)
  if (!Number.isFinite(num)) return '—'
  const fixed = num.toFixed(decimals)
  return decimals === 2 && fixed.endsWith('0') ? num.toFixed(1) : fixed
}

const formatNumericValue = (item, value = item.value) => {
  const decimals = item.decimals ?? 2
  if (item.trimSecondDecimal) return formatFlexibleDecimalValue(value, decimals)
  return Number(value).toFixed(decimals)
}

const formatAtsZeroText = (item) =>
  isAtsErrorStatus(item) ? 'No Error' : 'normal'

const decodeBitStatusItems = (item) => {
  if (!item.bitDecodeMap || !hasMetricValue(item)) return []
  const value = Number(item.value)
  if (!Number.isFinite(value)) return []
  return Object.entries(item.bitDecodeMap)
    .filter(([bit]) => (value & (1 << Number(bit))) !== 0)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([, text]) => text)
}

const isDecodedStatusInactive = (entry) => {
  const value = entry?.value
  if (value === false || value === 0 || value === '0') return true
  const text = String(entry?.text || '').trim().toLowerCase()
  return text === 'inactive' || text === 'offline' || text === 'off' || text === '0' || text === 'false'
}

const decodeApiStatusItems = (item) => {
  if (!Array.isArray(item.decodedItems) || !item.decodedItems.length) return []
  const active = item.decodedItems
    .filter((entry) => !isDecodedStatusInactive(entry))
    .map((entry) => entry.name || entry.text)
    .filter(Boolean)
  if (active.length) return active

  // value=0 且皆 off 時，顯示 bit0 name（Power Off 關機）
  if (isRacksWorkingStatus(item) && Number(item.value) === 0) {
    const powerOffName = item.decodedItems[0]?.name || item.decodedItems[0]?.text
    return powerOffName ? [powerOffName] : []
  }
  return []
}

const isDgPoint = (item) => /^DG_/.test(String(item.pointId || ''))
const isDgStatusPoint = (item) => isDgPoint(item) && item.statusKind === 'mode'
const isDgAlarmLikeStatus = (item) =>
  isDgStatusPoint(item)
  && /ALARM|RELAY_OUTPUTS|CONTROL_BITS|CONTROL_COMMAND/i.test(String(item.pointId || ''))

const decodeMappedStatusText = (item) => {
  if (!item.decodeMap || !hasMetricValue(item)) return ''
  return item.decodeMap[Number(item.value)] ?? item.decodeMap[String(item.value)] ?? ''
}

const formatDgStatusFallback = (item) => {
  const mapped = decodeMappedStatusText(item)
  if (mapped) return mapped
  if (item.bitDecodeMap && hasMetricValue(item)) {
    const items = decodeBitStatusItems(item)
    if (items.length) return items.join('、')
  }
  if (hasMetricValue(item) && Number(item.value) === 0) {
    return isDgAlarmLikeStatus(item) ? 'No Error' : '—'
  }
  return hasMetricValue(item) ? String(Number(item.value)) : '—'
}

const buildDgStatusItems = (item) => {
  const apiItems = decodeApiStatusItems(item)
  if (apiItems.length) return apiItems
  const mapped = decodeMappedStatusText(item)
  if (mapped) return [mapped]
  if (item.bitDecodeMap) {
    const bits = decodeBitStatusItems(item)
    if (bits.length) return bits
  }
  if (hasMetricValue(item) && Number(item.value) === 0 && isDgAlarmLikeStatus(item)) {
    return ['No Error']
  }
  if (item.decodedStatus) {
    return String(item.decodedStatus)
      .split('、')
      .map((text) => text.trim())
      .filter(Boolean)
  }
  return []
}

const formatMetricValue = (item) => {
  if (item.error) return item.error
  if (isBmsNoErrorZeroStatus(item)) return 'No Error'
  if (isAtsVoltagePoint(item)) {
    if (!hasMetricValue(item)) return '—'
    const value = formatNumericValue(item)
    return item.unit ? `${value} ${item.unit}` : value
  }
  if (isAtsZeroValue(item)) return formatAtsZeroText(item)
  if (item.useDecodedStatus && isDgStatusPoint(item)) {
    const items = decodeApiStatusItems(item)
    if (items.length) return items.join('、')
    if (item.decodedStatus) return item.decodedStatus
    return formatDgStatusFallback(item)
  }
  if (item.bitDecodeMap) {
    if (!hasMetricValue(item)) return '—'
    if (isZeroTextStatus(item)) return item.zeroText
    const items = decodeBitStatusItems(item)
    return items.length ? items.join('、') : String(Number(item.value))
  }
  if (item.decodeMap) {
    if (!hasMetricValue(item)) return '—'
    const mapped = item.decodeMap[Number(item.value)] ?? item.decodeMap[String(item.value)]
    return mapped || String(item.value)
  }
  if (item.useDecodedStatus) {
    if (!hasMetricValue(item) && !item.decodedItems?.length && !item.decodedStatus) return '—'
    const items = decodeApiStatusItems(item)
    if (items.length) return items.join('、')
    if (item.decodedStatus) return item.decodedStatus
    return hasMetricValue(item) ? String(Number(item.value)) : '—'
  }
  if (Number.isFinite(Number(item.scale))) {
    if (!hasMetricValue(item)) return '—'
    const scale = Number(item.scale)
    const value = formatNumericValue(item, Number(item.value) * scale)
    return item.unit ? `${value} ${item.unit}` : value
  }
  if (isDecodedStatusPoint(item)) {
    return formatStatusText(item) || '—'
  }
  if (item.decodedStatus) return item.decodedStatus
  if (!hasMetricValue(item)) return '—'
  const value = formatNumericValue(item)
  return item.unit ? `${value} ${item.unit}` : value
}

const buildStatusItems = (item) => {
  if (isBmsNoErrorZeroStatus(item)) return ['No Error']
  if (isAtsVoltagePoint(item)) return []
  if (isAtsZeroValue(item)) return [formatAtsZeroText(item)]
  if (item.useDecodedStatus && isDgStatusPoint(item)) return buildDgStatusItems(item)
  if (item.bitDecodeMap) {
    if (isZeroTextStatus(item)) return [item.zeroText]
    return decodeBitStatusItems(item)
  }
  if (item.decodeMap) {
    if (!hasMetricValue(item)) return []
    const mapped = item.decodeMap[Number(item.value)] ?? item.decodeMap[String(item.value)]
    return mapped ? [mapped] : []
  }
  if (item.useDecodedStatus) {
    const items = decodeApiStatusItems(item)
    if (items.length) return items
    if (!item.decodedStatus) return []
    return String(item.decodedStatus)
      .split('、')
      .map((text) => text.trim())
      .filter(Boolean)
  }
  if (!(isDecodedStatusPoint(item)) || !item.decodedStatus) {
    return []
  }
  return formatStatusText(item)
    .split('、')
    .map((text) => text.trim())
    .filter(Boolean)
}

const isNormalStatusText = (text) => String(text || '').trim().toLowerCase() === 'normal'

const isAlarmNormalStatus = (item) => {
  if (!isAlarmPoint(item)) return false
  const items = buildStatusItems(item)
  return items.length > 0 && items.every((text) => isNormalStatusText(text))
}

const isAtsAbnormalStatus = (item) => {
  if (!isAtsErrorStatus(item) || !item.decodedStatus) return false
  const items = buildStatusItems(item)
  return items.some((text) => !isNormalStatusText(text))
}

const formatDisplayPointId = (pointId) =>
  pointId
    .replace(/^BMS\d+_/, '')
    .replace(/^PCS\d+_/, '')
    .replace(/^UPS\d+_/, '')
    .replace(/^UPS_/, '')
    .replace(/^ATS_[A-Z0-9]+_/, '')
    .replace(/^MC_[A-Z0-9]+_/, '')
    .replace(/^RCB_[A-Z0-9]+_/, '')
    .replace(/^RELAY32_/, '')
    .replace(/^MPM\d+_/, '')
    .replace(/^MPM_DRB_CH[AB]\d+_/, '')
    .replace(/^MPM_GATEWAY_/, 'GATEWAY_')
    .replace(/^EMS_/, '')
    .replace(/^DG_/, '')
    .replace(/^FG4010_/, '')
    .replace(/^U1_/, '')
    .replace(/_U1_/g, '_')
    .replace('INSULATION_RESISTANCE', 'INSULATION_RES')
    .replace('IMPORT_ACTIVE_ENERGY', 'IMPORT_ENERGY')
    .replace('EXPORT_ACTIVE_ENERGY', 'EXPORT_ENERGY')
    .replace('ACTIVE_POWER_CONTROL_ENABLE', 'POWER_CONTROL_ENABLE')
    .replace('GRID_MODE_COMMAND', 'GRID_MODE')

const buildRows = (metrics) =>
  metrics.map((item) => {
    const displayValue = formatMetricValue(item)
    const statusItems = buildStatusItems(item)
    return {
      ...item,
      hasValue: isAtsZeroValue(item) ? true : hasDisplayValue(item),
      isAbnormal:
        !isAtsZeroValue(item)
        && (
          isRacksErrorAbnormal(item)
          || isAtsAbnormalStatus(item)
          || isBitWarningAbnormal(item)
        ),
      isWorkingStatus:
        (isRacksWorkingStatus(item) && Boolean(item.decodedStatus))
        || (isAtsNetworkStatus(item) && Boolean(item.decodedStatus) && !isAtsZeroValue(item)),
      isNormalZero: isAtsZeroValue(item) || isZeroTextStatus(item),
      isMcInfoStatus:
        (isMcPoint(item) || isRcbPoint(item))
        && Boolean(displayValue)
        && displayValue !== '—'
        && Boolean(item.decodedStatus),
      isAlarmStatus: isAlarmPoint(item) && Boolean(item.decodedStatus) && !isAlarmNormalStatus(item),
      isAlarmNormal: isAlarmNormalStatus(item),
      isAlarmPoint: isAlarmPoint(item),
      isPcsStatus: isPcsStatePoint(item),
      statusItems,
      displayPointId: formatDisplayPointId(item.pointId),
      displayValue,
      categoryLabel: ATS_CATEGORY_LABELS[item.statusKind] || item.label || '—'
    }
  })

const atsPanels = computed(() =>
  atsRealtimeUnits.map((unit) => {
    const rows = buildRows(unit.metrics.value)
    return {
      deviceId: unit.deviceId,
      label: unit.label,
      loading: unit.loading.value && !atsLoadedPanels.value[unit.deviceId],
      connectionError: unit.connectionError.value,
      latestRecordedAt: unit.latestRecordedAt.value,
      hasAnyValue: unit.hasAnyValue.value,
      minimized: Boolean(atsMinimizedPanels.value[unit.deviceId]),
      statusRows: rows.filter((row) => !isAtsVoltagePoint(row)),
      voltageRows: rows.filter((row) => isAtsVoltagePoint(row))
    }
  })
)

const toggleAtsPanel = (deviceId) => {
  atsMinimizedPanels.value = {
    ...atsMinimizedPanels.value,
    [deviceId]: !atsMinimizedPanels.value[deviceId]
  }
}

const mcPanels = computed(() =>
  mcRealtimeUnits.map((unit) => {
    const rows = buildRows(unit.metrics.value)
    return {
      deviceId: unit.deviceId,
      label: unit.label,
      loading: unit.loading.value && !mcLoadedPanels.value[unit.deviceId],
      connectionError: unit.connectionError.value,
      latestRecordedAt: unit.latestRecordedAt.value,
      hasAnyValue: unit.hasAnyValue.value,
      statusRows: rows
    }
  })
)

const mcLatestRecordedAt = computed(() => {
  const times = mcPanels.value.map((panel) => panel.latestRecordedAt).filter(Boolean).sort()
  return times.length ? times[times.length - 1] : ''
})

const rcbPanels = computed(() =>
  rcbRealtimeUnits.map((unit) => {
    const rows = buildRows(unit.metrics.value)
    return {
      deviceId: unit.deviceId,
      label: unit.label,
      loading: unit.loading.value && !rcbLoadedPanels.value[unit.deviceId],
      connectionError: unit.connectionError.value,
      latestRecordedAt: unit.latestRecordedAt.value,
      hasAnyValue: unit.hasAnyValue.value,
      statusRows: rows
    }
  })
)

const rcbLatestRecordedAt = computed(() => {
  const times = rcbPanels.value.map((panel) => panel.latestRecordedAt).filter(Boolean).sort()
  return times.length ? times[times.length - 1] : ''
})

const upsPanels = computed(() =>
  upsRealtimeUnits.map((unit) => {
    const rows = buildRows(unit.metrics.value)
    return {
      deviceId: unit.deviceId,
      label: unit.label,
      loading: unit.loading.value && !upsLoadedPanels.value[unit.deviceId],
      connectionError: unit.connectionError.value,
      latestRecordedAt: unit.latestRecordedAt.value,
      hasAnyValue: unit.hasAnyValue.value,
      statusRows: rows
    }
  })
)

const upsLatestRecordedAt = computed(() => {
  const times = upsPanels.value.map((panel) => panel.latestRecordedAt).filter(Boolean).sort()
  return times.length ? times[times.length - 1] : ''
})

const isGatewayActive = (item) => {
  const value = Number(item?.value)
  if (Number.isFinite(value)) return value !== 0
  return String(item?.text || '') !== '0' && String(item?.text || '').toLowerCase() !== 'off'
}

const meterGwPanel = computed(() => {
  const unit = mpmRealtimeUnits.find((item) => item.deviceId === 'METER_GW')
  if (!unit) {
    return {
      deviceId: 'METER_GW',
      label: '電表閘道',
      loading: false,
      connectionError: '',
      latestRecordedAt: '',
      hasAnyValue: false,
      error: '',
      displayValue: '',
      gatewayRows: []
    }
  }

  const metric = unit.metrics.value[0] || {}
  const gatewayRows = (metric.decodedItems || []).map((item) => ({
    ...item,
    isActive: isGatewayActive(item)
  }))

  return {
    deviceId: unit.deviceId,
    label: unit.label,
    loading: unit.loading.value && !mpmLoadedPanels.value[unit.deviceId],
    connectionError: unit.connectionError.value,
    latestRecordedAt: unit.latestRecordedAt.value,
    hasAnyValue: unit.hasAnyValue.value,
    error: metric.error || '',
    displayValue: formatMetricValue(metric),
    gatewayRows
  }
})

const mpmMeterPanels = computed(() =>
  mpmRealtimeUnits
    .filter((unit) => /^MPM(?:[1-4]|1[1-4])$/.test(unit.deviceId))
    .map((unit) => {
      const rows = buildRows(unit.metrics.value)
      return {
        deviceId: unit.deviceId,
        label: unit.label,
        loading: unit.loading.value && !mpmLoadedPanels.value[unit.deviceId],
        connectionError: unit.connectionError.value,
        latestRecordedAt: unit.latestRecordedAt.value,
        hasAnyValue: unit.hasAnyValue.value,
        statusRows: rows
      }
    })
)

const mpmDrbPanel = computed(() => {
  const unit = mpmRealtimeUnits.find((item) => item.deviceId === 'MPM_DRB')
  const emptyGroups = () =>
    MPM_DRB_CHANNEL_GROUPS.map((group) => ({
      key: group.key,
      label: group.label,
      channels: group.channels.map((channel) => ({ channel, statusRows: [] }))
    }))

  if (!unit) {
    return {
      deviceId: 'MPM_DRB',
      label: 'MPM DRB',
      loading: false,
      connectionError: '',
      latestRecordedAt: '',
      hasAnyValue: false,
      groups: emptyGroups()
    }
  }

  const rows = buildRows(unit.metrics.value)
  return {
    deviceId: unit.deviceId,
    label: unit.label,
    loading: unit.loading.value && !mpmLoadedPanels.value[unit.deviceId],
    connectionError: unit.connectionError.value,
    latestRecordedAt: unit.latestRecordedAt.value,
    hasAnyValue: unit.hasAnyValue.value,
    groups: MPM_DRB_CHANNEL_GROUPS.map((group) => ({
      key: group.key,
      label: group.label,
      channels: group.channels.map((channel) => ({
        channel,
        statusRows: rows.filter(
          (row) => row.channel === channel || row.pointId?.includes(`_${channel}_`)
        )
      }))
    }))
  }
})

const mpmLatestRecordedAt = computed(() => {
  const times = [
    meterGwPanel.value.latestRecordedAt,
    ...mpmMeterPanels.value.map((panel) => panel.latestRecordedAt),
    mpmDrbPanel.value.latestRecordedAt
  ]
    .filter(Boolean)
    .sort()
  return times.length ? times[times.length - 1] : ''
})

const emsPanel = computed(() => {
  const unit = emsRealtimeUnits[0]
  if (!unit) {
    return {
      loading: false,
      connectionError: '',
      latestRecordedAt: '',
      hasAnyValue: false,
      statusRows: []
    }
  }

  const rows = buildRows(unit.metrics.value)
  return {
    loading: unit.loading.value && !emsLoadedPanels.value[unit.deviceId],
    connectionError: unit.connectionError.value,
    latestRecordedAt: unit.latestRecordedAt.value,
    hasAnyValue: unit.hasAnyValue.value,
    statusRows: rows
  }
})

const emsLatestRecordedAt = computed(() => emsPanel.value.latestRecordedAt || '')

const buildPointColumns = (rows, columnCount = null) => {
  if (!rows.length) return []
  const columns = []
  const targetColumns = columnCount && columnCount > 0
    ? columnCount
    : Math.ceil(rows.length / 7)
  const rowsPerColumn = Math.ceil(rows.length / targetColumns)
  for (let index = 0; index < rows.length; index += rowsPerColumn) {
    columns.push(rows.slice(index, index + rowsPerColumn))
  }
  return columns
}

const dgPanel = computed(() => {
  const unit = dgRealtimeUnits[0]
  if (!unit) {
    return {
      loading: false,
      connectionError: '',
      latestRecordedAt: '',
      hasAnyValue: false,
      statusRows: [],
      pointColumns: []
    }
  }

  const rows = buildRows(unit.metrics.value)
  const statusRows = rows.filter(
    (row) => row.decodeMap || row.bitDecodeMap || row.statusKind === 'mode'
  )
  const metricRows = rows.filter(
    (row) => !(row.decodeMap || row.bitDecodeMap || row.statusKind === 'mode')
  )
  return {
    loading: unit.loading.value && !dgLoadedPanels.value[unit.deviceId],
    connectionError: unit.connectionError.value,
    latestRecordedAt: unit.latestRecordedAt.value,
    hasAnyValue: unit.hasAnyValue.value,
    statusRows,
    pointColumns: buildPointColumns(metricRows, 3)
  }
})

const dgLatestRecordedAt = computed(() => dgPanel.value.latestRecordedAt || '')

const fg4010Panel = computed(() => {
  const unit = fg4010RealtimeUnits[0]
  if (!unit) {
    return {
      loading: false,
      connectionError: '',
      latestRecordedAt: '',
      hasAnyValue: false,
      pointColumns: []
    }
  }

  const rows = buildRows(unit.metrics.value)
  return {
    loading: unit.loading.value && !fg4010LoadedPanels.value[unit.deviceId],
    connectionError: unit.connectionError.value,
    latestRecordedAt: unit.latestRecordedAt.value,
    hasAnyValue: unit.hasAnyValue.value,
    pointColumns: buildPointColumns(rows, 4)
  }
})

const fg4010LatestRecordedAt = computed(() => fg4010Panel.value.latestRecordedAt || '')

const isStatusRow = (row) => row.displayPointId.includes('STATUS')
const isIndexRow = (row) => Boolean(row.indexText)
const isPcsStatusColumn = (column) => column.some((row) => row.isPcsStatus)

const buildPanels = (units, loadedPanels, minimizedPanels) =>
  units.map((unit) => {
    const rows = buildRows(unit.metrics.value)
    const metricRows = rows.filter((row) => !isStatusRow(row) && !isIndexRow(row))
    const indexRows = rows.filter((row) => isIndexRow(row))
    const statusRows = rows.filter((row) => isStatusRow(row))
    const pcsStatusRows = rows.filter((row) => row.isPcsStatus)
    const pcsMetricRows = rows.filter((row) => !row.isPcsStatus)
    return {
      panelIndex: unit.panelIndex,
      selectedUnit: unit.unitIndexRef.value,
      loading: unit.loading.value && !loadedPanels[unit.panelIndex],
      connectionError: unit.connectionError.value,
      latestRecordedAt: unit.latestRecordedAt.value,
      hasAnyValue: unit.hasAnyValue.value,
      minimized: Boolean(minimizedPanels[unit.panelIndex]),
      metricRows,
      indexRows,
      statusRows,
      pointColumns: pcsStatusRows.length
        ? [pcsStatusRows, ...buildPointColumns(pcsMetricRows, 3)]
        : buildPointColumns(rows)
    }
  })

const bmsPanels = computed(() =>
  buildPanels(bmsRealtimeUnits, bmsLoadedPanels.value, bmsMinimizedPanels.value)
)

const pcsPanels = computed(() =>
  buildPanels(pcsRealtimeUnits, pcsLoadedPanels.value, pcsMinimizedPanels.value)
)

const allLatestRecordedAt = computed(() => {
  const times = [
    ...bmsPanels.value.map((panel) => panel.latestRecordedAt),
    ...pcsPanels.value.map((panel) => panel.latestRecordedAt),
    ...atsPanels.value.map((panel) => panel.latestRecordedAt),
    ...mcPanels.value.map((panel) => panel.latestRecordedAt),
    ...rcbPanels.value.map((panel) => panel.latestRecordedAt),
    emsPanel.value.latestRecordedAt,
    ...upsPanels.value.map((panel) => panel.latestRecordedAt),
    meterGwPanel.value.latestRecordedAt,
    ...mpmMeterPanels.value.map((panel) => panel.latestRecordedAt),
    mpmDrbPanel.value.latestRecordedAt,
    dgPanel.value.latestRecordedAt,
    fg4010Panel.value.latestRecordedAt
  ]
    .filter(Boolean)
    .sort()
  return times.length ? times[times.length - 1] : ''
})

const hasAnyBmsValue = computed(() => bmsPanels.value.some((panel) => panel.hasAnyValue))
const hasAnyPcsValue = computed(() => pcsPanels.value.some((panel) => panel.hasAnyValue))

const setDevicePanelUnit = (panelUnitRefs, loadedPanels, panelIndex, unitIndex) => {
  panelUnitRefs[panelIndex - 1].value = unitIndex
  loadedPanels.value = {
    ...loadedPanels.value,
    [panelIndex]: false
  }
}

const toggleDevicePanel = (minimizedPanels, panelIndex) => {
  minimizedPanels.value = {
    ...minimizedPanels.value,
    [panelIndex]: !minimizedPanels.value[panelIndex]
  }
}

const setBmsPanelUnit = (panelIndex, unitIndex) =>
  setDevicePanelUnit(bmsPanelUnitRefs, bmsLoadedPanels, panelIndex, unitIndex)

const setPcsPanelUnit = (panelIndex, unitIndex) =>
  setDevicePanelUnit(pcsPanelUnitRefs, pcsLoadedPanels, panelIndex, unitIndex)

const toggleBmsPanel = (panelIndex) => toggleDevicePanel(bmsMinimizedPanels, panelIndex)

const togglePcsPanel = (panelIndex) => toggleDevicePanel(pcsMinimizedPanels, panelIndex)

const refreshAll = async () => {
  manualRefreshing.value = true
  try {
    await Promise.all([
      ...bmsRealtimeUnits.map((unit) => unit.fetchAll()),
      ...pcsRealtimeUnits.map((unit) => unit.fetchAll()),
      ...atsRealtimeUnits.map((unit) => unit.fetchAll()),
      ...mcRealtimeUnits.map((unit) => unit.fetchAll()),
      ...rcbRealtimeUnits.map((unit) => unit.fetchAll()),
      ...mpmRealtimeUnits.map((unit) => unit.fetchAll()),
      ...emsRealtimeUnits.map((unit) => unit.fetchAll()),
      ...fg4010RealtimeUnits.map((unit) => unit.fetchAll()),
      ...upsRealtimeUnits.map((unit) => unit.fetchAll()),
      ...dgRealtimeUnits.map((unit) => unit.fetchAll())
    ])
  } finally {
    manualRefreshing.value = false
  }
}

const goBack = () => {
  router.push('/ess-system')
}
</script>

<style scoped>
.pcs-full-page {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: calc(100vh - 60px);
  background: #f5f7fa;
}

.pcs-full-card {
  border-left: 4px solid #409eff;
}

.pcs-full-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.pcs-full-title {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 30px;
  font-weight: 800;
  color: #303133;
}

.pcs-full-site-id {
  padding: 4px 10px;
  border-radius: 999px;
  background: #ecf5ff;
  border: 1px solid #b3d8ff;
  color: #1f5f99;
  font-size: 16px;
  font-weight: 700;
}

.pcs-full-subtitle {
  margin-top: 8px;
  font-size: 16px;
  color: #909399;
}

.pcs-full-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.device-detail-tabs {
  margin-top: 4px;
}

.device-detail-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
  border-bottom: 2px solid #dcdfe6;
}

.device-detail-tabs :deep(.el-tabs__nav-wrap) {
  display: flex;
  justify-content: flex-end;
}

.device-detail-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.device-detail-tabs :deep(.el-tabs__nav-scroll) {
  display: flex;
  justify-content: flex-end;
}

.device-detail-tabs :deep(.el-tabs__nav) {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  float: none;
}

.device-detail-tabs :deep(.el-tabs__active-bar) {
  display: none;
}

.device-detail-tabs :deep(.el-tabs__item) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 78px;
  height: 40px;
  margin: 0;
  padding: 0 18px 8px !important;
  border: 1px solid transparent;
  border-bottom: none;
  border-radius: 12px 12px 0 0;
  font-size: 18px;
  font-weight: 800;
  line-height: 1;
  opacity: 0.9;
  text-align: center;
  clip-path: polygon(8% 0, 92% 0, 100% 100%, 0 100%);
  transition: opacity 0.15s ease, transform 0.15s ease, filter 0.15s ease, box-shadow 0.15s ease;
}

.device-detail-tabs :deep(.el-tabs__item.is-top:nth-child(2)),
.device-detail-tabs :deep(.el-tabs__item.is-top:last-child),
.device-detail-tabs :deep(#tab-bms),
.device-detail-tabs :deep(#tab-rcb) {
  padding-left: 18px !important;
  padding-right: 18px !important;
}

.device-detail-tabs :deep(.el-tabs__item .el-tabs__item__label),
.device-detail-tabs :deep(.el-tabs__item span) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 0;
  line-height: 1;
  text-align: center;
  transform: none;
}

.device-detail-tabs :deep(#tab-bms) {
  background: #e8f5e9;
  color: #2e7d32 !important;
  border-color: #a5d6a7;
}

.device-detail-tabs :deep(#tab-pcs) {
  background: #e3f2fd;
  color: #1565c0 !important;
  border-color: #90caf9;
}

.device-detail-tabs :deep(#tab-ats) {
  background: #fff3e0;
  color: #ef6c00 !important;
  border-color: #ffcc80;
}

.device-detail-tabs :deep(#tab-mc) {
  background: #f3e5f5;
  color: #6a1b9a !important;
  border-color: #ce93d8;
}

.device-detail-tabs :deep(#tab-mpm) {
  background: #e0f7fa;
  color: #00838f !important;
  border-color: #80deea;
}

.device-detail-tabs :deep(#tab-rcb) {
  background: #ffebee;
  color: #c62828 !important;
  border-color: #ef9a9a;
}

.device-detail-tabs :deep(#tab-ems) {
  background: #ede7f6;
  color: #4527a0 !important;
  border-color: #b39ddb;
}

.device-detail-tabs :deep(#tab-ups) {
  background: #fff8e1;
  color: #f57f17 !important;
  border-color: #ffe082;
}

.device-detail-tabs :deep(#tab-dg) {
  background: #efebe9;
  color: #5d4037 !important;
  border-color: #bcaaa4;
}

.device-detail-tabs :deep(.el-tabs__item.is-active) {
  opacity: 1;
  height: 46px;
  transform: translateY(2px);
  filter: none;
  z-index: 1;
  box-shadow: 0 -2px 8px rgba(48, 49, 51, 0.08);
}

.device-detail-tabs :deep(#tab-bms.is-active) {
  background: #c8e6c9;
  color: #1b5e20 !important;
}

.device-detail-tabs :deep(#tab-pcs.is-active) {
  background: #bbdefb;
  color: #0d47a1 !important;
}

.device-detail-tabs :deep(#tab-ats.is-active) {
  background: #ffe0b2;
  color: #e65100 !important;
}

.device-detail-tabs :deep(#tab-mc.is-active) {
  background: #e1bee7;
  color: #4a148c !important;
}

.device-detail-tabs :deep(#tab-mpm.is-active) {
  background: #b2ebf2;
  color: #006064 !important;
}

.device-detail-tabs :deep(#tab-rcb.is-active) {
  background: #ffcdd2;
  color: #b71c1c !important;
}

.device-detail-tabs :deep(#tab-ems.is-active) {
  background: #d1c4e9;
  color: #311b92 !important;
}

.device-detail-tabs :deep(#tab-ups.is-active) {
  background: #ffecb3;
  color: #e65100 !important;
}

.device-detail-tabs :deep(#tab-dg.is-active) {
  background: #d7ccc8;
  color: #3e2723 !important;
}

.device-detail-tabs :deep(.el-tabs__item:hover) {
  opacity: 1;
}

.device-detail-tabs :deep(.el-tabs__content) {
  padding-top: 16px;
}

.pcs-full-alert {
  margin: 12px 14px 0;
}

.pcs-full-status {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
}

.pcs-panel-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pcs-panel {
  overflow: hidden;
  border: 1px solid #d9ecff;
  border-left: 4px solid #409eff;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 2px 10px rgba(64, 158, 255, 0.08);
}

.pcs-panel.is-minimized {
  border-left-color: #909399;
}

.bms-panel {
  border-left-color: #2e7d32;
}

.pcs-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  background: linear-gradient(90deg, #ecf5ff 0%, #ffffff 100%);
  border-bottom: 1px solid #d9ecff;
}

.pcs-panel.is-minimized .pcs-panel-header {
  border-bottom: none;
}

.pcs-panel-title {
  font-size: 22px;
  font-weight: 800;
  color: #303133;
}

.pcs-panel-subtitle {
  margin-top: 3px;
  font-size: 13px;
  color: #909399;
}

.pcs-panel-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.pcs-panel-select {
  width: 112px;
}

.bms-detail-grid {
  display: grid;
  grid-template-columns: minmax(620px, 1.55fr) minmax(250px, 0.7fr) minmax(320px, 0.95fr);
  gap: 8px;
  align-items: start;
  overflow-x: auto;
  padding: 10px;
}

.ats-detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  align-items: start;
  overflow-x: auto;
  padding: 10px;
}

.ats-status-panel,
.ats-voltage-panel {
  max-width: none;
  min-width: 0;
}

.ats-status-panel .pcs-column-header,
.ats-voltage-panel .pcs-column-header,
.ats-status-panel .pcs-point-row,
.ats-voltage-panel .pcs-point-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 148px;
  gap: 12px;
  align-items: center;
  box-sizing: border-box;
}

.ats-status-panel .pcs-column-header,
.ats-voltage-panel .pcs-column-header {
  margin-bottom: 7px;
  padding: 7px 16px;
}

.ats-status-panel .pcs-point-row,
.ats-voltage-panel .pcs-point-row {
  margin: 0 8px 3px;
  padding: 4px 8px;
}

.ats-status-panel .pcs-column-header span:first-child,
.ats-voltage-panel .pcs-column-header span:first-child,
.ats-status-panel .pcs-point-id,
.ats-voltage-panel .pcs-point-id {
  text-align: left;
  justify-self: stretch;
}

.ats-status-panel .pcs-column-header span:last-child,
.ats-voltage-panel .pcs-column-header span:last-child,
.ats-status-panel .pcs-value,
.ats-voltage-panel .pcs-value {
  text-align: left;
  justify-self: stretch;
}

.ats-status-panel .pcs-point-id,
.ats-voltage-panel .pcs-point-id {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ats-status-panel .pcs-value,
.ats-voltage-panel .pcs-value {
  overflow: visible;
  text-overflow: clip;
  white-space: nowrap;
  min-width: 0;
}

.ats-status-panel .pcs-value.is-normal-zero {
  color: #1565c0;
}

.ats-status-panel .pcs-value.is-working-status {
  color: #00a344;
}

.mc-detail-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  padding: 10px;
}

.rcb-detail-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  padding: 10px;
}

.dg-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding: 10px;
  align-items: start;
}

.dg-status-panel {
  min-width: 0;
}

.dg-status-panel .pcs-column-header,
.dg-status-panel .pcs-point-row {
  grid-template-columns: minmax(0, 1fr) minmax(180px, 1.4fr);
}

.mpm-stack {
  display: grid;
  gap: 12px;
  padding: 10px;
}

.mpm-layout {
  display: grid;
  grid-template-columns: minmax(240px, 0.75fr) minmax(0, 2.25fr);
  gap: 12px;
  align-items: start;
}

.mpm-meter-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  min-width: 0;
}

.mpm-gateway-panel {
  min-width: 0;
}

.mpm-drb-section {
  min-width: 0;
}

.mpm-drb-header {
  margin-bottom: 10px;
}

.mpm-drb-group + .mpm-drb-group {
  margin-top: 14px;
}

.mpm-drb-group-title {
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #606266;
}

.mpm-drb-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(280px, 1fr));
  gap: 12px;
  overflow-x: auto;
}

.mpm-drb-grid .pcs-column-header,
.mpm-drb-grid .pcs-point-row {
  grid-template-columns: minmax(0, 1fr) 110px;
  gap: 10px;
  align-items: start;
}

.mpm-drb-grid .pcs-column-header {
  padding: 7px 12px;
}

.mpm-drb-grid .pcs-point-row {
  margin: 0 6px 3px;
  padding: 4px 6px;
}

.mpm-drb-grid .pcs-point-id {
  overflow: visible;
  text-overflow: clip;
  white-space: normal;
  word-break: break-word;
  line-height: 1.3;
}

.mpm-drb-grid .pcs-column-header span:last-child,
.mpm-drb-grid .pcs-value {
  width: 110px;
  min-width: 110px;
  max-width: 110px;
  justify-self: end;
  text-align: right;
  white-space: normal;
  word-break: break-word;
  line-height: 1.3;
}

.mc-status-panel {
  min-width: 0;
}

.mc-column-title {
  margin-bottom: 8px;
  padding: 0 2px;
}

.mc-column-device {
  font-size: 15px;
  font-weight: 700;
  color: #1f2d3d;
  line-height: 1.3;
}

.mc-column-meta {
  margin-top: 2px;
  font-size: 12px;
  color: #909399;
  line-height: 1.3;
}

.mc-status-panel .pcs-value.is-normal-zero {
  color: #1565c0;
}

@media (max-width: 1400px) {
  .rcb-detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dg-detail-grid {
    grid-template-columns: 1fr;
  }

  .mpm-layout {
    grid-template-columns: 1fr;
  }

  .mpm-drb-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 1200px) {
  .mc-detail-grid,
  .rcb-detail-grid,
  .dg-detail-grid,
  .mpm-meter-grid,
  .mpm-drb-grid {
    grid-template-columns: 1fr;
  }
}

.ats-status-panel .bms-status-list,
.ats-voltage-panel .bms-status-list {
  margin: 0;
  padding-left: 0;
  list-style: none;
}

.ats-status-panel .bms-status-list li,
.ats-voltage-panel .bms-status-list li {
  white-space: nowrap;
  text-align: left;
}

.bms-detail-column {
  min-height: 188px;
  padding: 0 0 8px;
  border: 1px solid #0f6b7a;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(15, 107, 122, 0.12);
}

.bms-index-header,
.bms-index-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 78px 136px;
  gap: 4px;
  align-items: baseline;
}

.bms-index-header {
  padding: 7px 10px;
  margin-bottom: 7px;
  background: #0f6b7a;
  font-size: 15px;
  font-weight: 800;
  color: #fff;
  text-align: center;
}

.bms-index-header span {
  text-align: center;
}

.bms-index-row {
  min-height: 23px;
  margin: 0 5px 3px;
  padding: 4px 6px;
  border-radius: 4px;
}

.bms-index-row:nth-child(even) {
  background: #eef9fc;
}

.bms-index-row:nth-child(odd) {
  background: #fff8e6;
}

.bms-index-value {
  overflow: hidden;
  color: #1565c0;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.3;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bms-status-column .pcs-point-row {
  grid-template-columns: minmax(190px, 210px) minmax(0, 1fr);
  align-items: center;
}

.bms-status-column .bms-status-header {
  display: block;
  text-align: center;
}

.bms-status-column .pcs-point-id {
  overflow: visible;
  text-overflow: clip;
}

.bms-status-point {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.bms-status-raw-value {
  color: #606266;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.5;
  text-align: left;
}

.pcs-value.bms-status-value {
  color: #1565c0;
  font-size: 15px;
  overflow: visible;
  text-align: left;
  text-overflow: clip;
  white-space: nowrap;
}

.pcs-value.bms-status-value.is-working-status {
  color: #00a344;
}

.bms-status-list {
  margin: 0;
  padding-left: 14px;
}

.bms-status-list li {
  line-height: 1.45;
  text-align: left;
  white-space: nowrap;
}

.pcs-point-grid {
  display: grid;
  grid-template-columns: minmax(400px, 1.2fr) repeat(3, minmax(280px, 1fr));
  gap: 8px;
  align-items: start;
  overflow-x: auto;
  padding: 14px;
}

.pcs-point-column {
  min-width: 0;
  min-height: 230px;
  padding: 0 0 8px;
  border: 1px solid #0f6b7a;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(15, 107, 122, 0.12);
}

.pcs-point-grid .pcs-column-header {
  grid-template-columns: minmax(0, 1fr) 100px;
}

.pcs-point-grid .pcs-point-row {
  grid-template-columns: minmax(0, 1fr) 100px;
  gap: 6px;
  align-items: center;
}

.pcs-point-grid .pcs-status-column .pcs-column-header,
.pcs-point-grid .pcs-status-column .pcs-point-row {
  grid-template-columns: 210px minmax(0, 1fr);
  gap: 8px;
}

.pcs-point-grid .pcs-point-id {
  overflow: hidden;
  font-family: Consolas, 'Courier New', monospace;
  font-size: 18px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pcs-point-grid .pcs-value {
  overflow: hidden;
  font-size: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pcs-column-header,
.pcs-point-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 76px;
  gap: 5px;
  align-items: baseline;
}

.pcs-column-header {
  padding: 7px 10px;
  margin-bottom: 7px;
  background: #0f6b7a;
  font-size: 15px;
  font-weight: 800;
  color: #fff;
  text-align: center;
}

.pcs-column-header span {
  text-align: center;
}

.pcs-point-row {
  padding: 4px 8px;
  margin: 0 8px 3px;
  min-height: 23px;
  border-radius: 4px;
}

.pcs-point-row:nth-child(even) {
  background: #eef9fc;
}

.pcs-point-row:nth-child(odd) {
  background: #fff8e6;
}

.pcs-point-id {
  font-family: Consolas, 'Courier New', monospace;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
  color: #0f172a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-break: normal;
}

.pcs-value {
  font-size: 18px;
  font-weight: 800;
  color: #00a344;
  line-height: 1.3;
  overflow: hidden;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-break: normal;
}

.pcs-value.is-error {
  color: #e6a23c;
}

.pcs-value.is-abnormal {
  color: #f56c6c;
}

.pcs-value.is-empty {
  color: #909399;
}

.pcs-status-column {
  min-width: 400px;
  overflow: hidden;
}

.pcs-status-column .pcs-point-row {
  grid-template-columns: 210px minmax(0, 1fr);
  align-items: center;
}

.pcs-status-column .pcs-status-header {
  display: block;
  text-align: center;
  white-space: nowrap;
}

.pcs-status-column .pcs-point-id {
  overflow: hidden;
  font-family: Consolas, 'Courier New', monospace;
  font-size: 18px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pcs-status-column .pcs-value {
  overflow: visible;
  font-size: 15px;
  text-align: left;
  text-overflow: clip;
  white-space: normal;
}

.pcs-status-column .pcs-value.is-alarm-status {
  color: #f56c6c;
}

.pcs-status-column .pcs-value.is-alarm-normal {
  color: #1565c0;
}

.pcs-status-list {
  margin: 0;
  padding-left: 14px;
}

.pcs-status-list li {
  line-height: 1.45;
  text-align: left;
  white-space: nowrap;
}

.pcs-status-list li.is-normal-text {
  color: #1565c0;
}

@media (max-width: 768px) {
  .pcs-full-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .pcs-full-actions {
    justify-content: flex-start;
    width: 100%;
  }

  .pcs-point-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
