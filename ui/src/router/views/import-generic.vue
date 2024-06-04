<script>
import Layout from '@/router/layouts/main.vue'
import { mapState } from 'vuex'
import axios from 'axios'
import Papa from 'papaparse'

export default {
  page: {
    title: 'Generic Import',
    meta: [{ name: 'description', content: 'The Generic Import page.' }],
  },
  components: { Layout },
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  data: function () {
    return {
      file: null,
      tryingToCreate: false,
      errors: [],
      papaConfig: { dynamicTyping: true, skipEmptyLines: true, complete: this.assignResults },
      fileData: null,
      fileHeadings: null,
      myVehicles: [],
      selectedVehicle: null,
      invertFullTank: null,
      filledValueString: '',
      notFilledValueString: '',
      isFullTankString: false,
      fileHeadingMap: {
        fuelQuantity: null,
        perUnitPrice: null,
        totalAmount: null,
        odoReading: null,
        isTankFull: null,
        hasMissedFillup: null,
        comments: [], // [int]
        fillingStation: null,
        date: null,
        fuelSubType: null,
      },
    }
  },
  computed: {
    ...mapState('utils', ['isMobile']),
    ...mapState('vehicles', ['vehicles']),
    uploadButtonLabel() {
      if (this.isMobile) {
        if (this.file == null) {
          return this.$t('choosephoto')
        } else {
          return ''
        }
      } else {
        if (this.file == null) {
          return this.$t('choosefile')
        } else {
          return ''
        }
      }
    },
  },
  mounted() {
    this.myVehicles = this.vehicles
  },
  methods: {
    assignResults(results, file) {
      this.fileData = results.data
      this.fileHeadings = results.data[0]
    },
    parseCSV() {
      if (this.file == null) {
        return
      }
      this.errorMessage = ''
      Papa.parse(this.file, this.papaConfig)
    },
    getUsedHeadings() {
      return Object.keys(this.fileHeadingMap).filter((k) => this.fileHeadingMap[k] != null) // filter non-null properties
    },
    getTimezone() {
      return Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    csvToJson() {
      const data = []
      const headings = this.getUsedHeadings().reduce((a, k) => ({ ...a, [k]: this.fileHeadingMap[k] }), {}) // create new object from filter
      const comments = (row) => {
        return this.fileHeadingMap.comments.reduce((a, fi) => {
          // TODO: sanitize to prevent XSS
          return `${a}${this.fileHeadings[fi]}: ${row[fi]}\n`
        }, '')
      }
      const calculateTotal = (row) => {
        return this.fileHeadingMap.totalAmount === -1
          ? row[this.fileHeadingMap.fuelQuantity] * row[this.fileHeadingMap.perUnitPrice]
          : row[this.fileHeadingMap.totalAmount]
      }

      const setFullTank = (row) => {
        if (row[this.fileHeadingMap.isTankFull].toLowerCase() === this.filledValueString.toLowerCase()) {
          return true
        } else if (row[this.fileHeadingMap.isTankFull].toLowerCase() === this.notFilledValueString.toLowerCase()) {
          return false
        } else {
          // TODO: need to handle errors better
          throw Error
        }
      }

      for (let r = 1; r < this.fileData.length; r++) {
        const row = this.fileData[r]
        const item = {}
        Object.keys(headings).forEach((k) => {
          if (k === 'comments') {
            item[k] = comments(row)
          } else if (k === 'totalAmount') {
            item[k] = calculateTotal(row)
          } else if (k === 'isTankFull') {
            if (this.isFullTankString) {
              item[k] = setFullTank(row)
            } else {
              if (this.invertFullTank) {
                item[k] = Boolean(!row[headings[k]])
              } else {
                item[k] = Boolean(row[headings[k]])
              }
            }
          } else if (k === 'hasMissedFillup') {
            // TODO: need to account for this field being a string
            item[k] = Boolean(row[headings[k]])
          } else if (k === 'date') {
            item[k] = new Date(row[headings[k]]).toISOString()
          } else {
            item[k] = row[headings[k]]
          }
        })
        data.push(item)
      }
      return data
    },
    importData() {
      if (this.errors.length === 0) {
        try {
          const content = {
            data: this.csvToJson(),
            vehicleId: this.selectedVehicle.id,
            timezone: this.getTimezone(),
          }
          axios
            .post('/api/import/generic', content)
            .then((data) => {
              this.$buefy.toast.open({
                message: this.$t('importsuccessfull'),
                type: 'is-success',
                duration: 3000,
              })
              setTimeout(() => this.$router.push({ name: 'home' }), 1000)
            })
            .catch((ex) => {
              this.$buefy.toast.open({
                duration: 5000,
                message: this.$t('importerror'),
                position: 'is-bottom',
                type: 'is-danger',
              })
              console.log(ex)
              if (ex.response && ex.response.data.error) {
                this.errors.push(ex.response.data.error)
              }
            })
        } catch (e) {
          // TODO: handle error
          this.errors.push(e)
        }
      } else {
        this.errors.push('fix errors')
      }
    },
    checkFieldString() {
      const tankFull = this.fileData[1][this.fileHeadingMap.isTankFull]
      if (typeof tankFull !== 'boolean' && typeof tankFull === 'string') {
        this.isFullTankString = true
      }
    },
    clearHeadingProperty(property) {
      if (property === 'comments') {
        this.fileHeadingMap[property] = []
      } else {
        this.fileHeadingMap[property] = null
      }
    },
  },
}
</script>

<template>
  <Layout>
    <div class="columns box">
      <div class="column">
        <h1 class="title">{{ $t('importgeneric') }}</h1>
      </div>
    </div>
    <br />
    <div v-if="fileData === null" class="columns">
      <div class="column">
        <p class="subtitle"> {{ $t('stepstoimport', { name: 'CSV' }) }}</p>
        <ol>
          <!-- <li>{{ $t('importhintcreatecsv', { 'name': 'Fuelly' }) }} <a href="http://docs.fuelly.com/acar-import-export-center" target="_nofollow">{{ $t('here') }}</a>.</li> -->
          <li>{{ $t('importgenerichintdata') }}</li>
          <li>{{ $t('importhintvehiclecreated') }}</li>
          <li v-html="$t('importhintcurrdist')"></li>
          <li v-html="$t('importhintunits')"></li>
          <li>
            <b>{{ $t('dontimportagain') }}</b>
          </li>
        </ol>
      </div>
    </div>
    <div v-if="fileData === null" class="section box">
      <div class="columns">
        <div class="column is-two-thirds">
          <p class="subtitle">{{ $t('choosedatafile') }}</p>
        </div>
        <div class="column is-one-third is-flex is-align-content-center">
          <form @submit.prevent="parseCSV">
            <div class="columns">
              <div class="column">
                <b-field class="file is-primary" :class="{ 'has-name': !!file }">
                  <b-upload v-model="file" class="file-label" accept=".csv" required>
                    <span class="file-cta">
                      <b-icon class="file-icon" icon="upload"></b-icon>
                      <span class="file-label">{{ uploadButtonLabel }}</span>
                    </span>
                    <span v-if="file" class="file-name" :class="isMobile ? 'file-name-mobile' : 'file-name-desktop'">
                      {{ file.name }}
                    </span>
                  </b-upload>
                </b-field>
              </div>
              <div class="column">
                <b-button tag="button" native-type="submit" type="is-primary" class="control">
                  {{ $t('import') }}
                </b-button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
    <div v-else class="columns">
      <div class="column">
        <p class="subtitle">Map Fields</p>
        <form class="" @submit.prevent="importData">
          <b-field :label="$t('selectvehicle')">
            <b-select v-model="selectedVehicle" :placeholder="$t('vehicle')" required expanded>
              <option v-for="option in myVehicles" :key="option.id" :value="option">
                {{ option.nickname }}
              </option>
            </b-select>
          </b-field>
          <span v-if="selectedVehicle !== null">
            <b-field :label="$t('fillupdate')">
              <b-select v-model="fileHeadingMap.date" required expanded>
                <option v-for="(option, index) in fileHeadings" :key="index" :value="index">
                  {{ option }}
                </option>
              </b-select>
            </b-field>
            <b-field>
              <template v-slot:label>
                {{ $t('fuelsubtype') }}
                <b-tooltip type="is-dark" label="Clear selection">
                  <b-button
                    type="is-ghost"
                    size="is-small"
                    icon-pack="fas"
                    icon-right="arrow-rotate-left"
                    @click="clearHeadingProperty('fuelSubType')"
                  ></b-button>
                </b-tooltip>
              </template>
              <b-select v-model="fileHeadingMap.fuelSubType" expanded>
                <option v-for="(option, index) in fileHeadings" :key="index" :value="index">
                  {{ option }}
                </option>
              </b-select>
            </b-field>
            <b-field :label="$t('quantity')">
              <b-select v-model="fileHeadingMap.fuelQuantity" expanded required>
                <option v-for="(option, index) in fileHeadings" :key="index" :value="index">
                  {{ option }}
                </option>
              </b-select>
            </b-field>
            <b-field :label="$t('per', { '0': $t('price'), '1': $t('unit.short.' + selectedVehicle.fuelUnitDetail.key) })">
              <b-select v-model.number="fileHeadingMap.perUnitPrice" type="number" min="0" step=".001" expanded required>
                <option v-for="(option, index) in fileHeadings" :key="index" :value="index">
                  {{ option }}
                </option>
              </b-select>
            </b-field>
            <b-field :label="$t('totalamountpaid')">
              <b-select v-model.number="fileHeadingMap.totalAmount" expanded required>
                <option value="-1">Calculated</option>
                <option v-for="(option, index) in fileHeadings" :key="index" :value="index">
                  {{ option }}
                </option>
              </b-select>
            </b-field>
            <b-field :label="$t('odometer')">
              <b-select v-model.number="fileHeadingMap.odoReading" expanded required>
                <option v-for="(option, index) in fileHeadings" :key="index" :value="index">
                  {{ option }}
                </option>
              </b-select>
            </b-field>
            <b-field :label="$t('tankpartialfull')">
              <b-radio-button v-model="invertFullTank" native-value="false">{{ $t('fulltank') }}</b-radio-button>
              <b-radio-button v-model="invertFullTank" native-value="true">{{ $t('partialfillup') }}</b-radio-button>
            </b-field>
            <b-field>
              <b-select v-model="fileHeadingMap.isTankFull" required @input="checkFieldString">
                <option v-for="(option, index) in fileHeadings" :key="index" :value="index">
                  {{ option }}
                </option>
              </b-select>
            </b-field>
            <span v-if="isFullTankString === true" required>
              <b-field label="Value when tank is filled">
                <b-input v-model="filledValueString"></b-input>
              </b-field>
              <b-field label="Value when tank was not completely filled">
                <b-input v-model="notFilledValueString"></b-input>
              </b-field>
            </span>
            <b-field>
              <template v-slot:label>
                {{ $t('missedfillup') }}
                <b-tooltip type="is-dark" label="Clear selection">
                  <b-button
                    type="is-ghost"
                    size="is-small"
                    icon-pack="fas"
                    icon-right="arrow-rotate-left"
                    @click="clearHeadingProperty('hasMissedFillup')"
                  ></b-button>
                </b-tooltip>
              </template>
              <b-select v-model="fileHeadingMap.hasMissedFillup">
                <option v-for="(option, index) in fileHeadings" :key="index" :value="index">
                  {{ option }}
                </option>
              </b-select>
            </b-field>
            <b-field>
              <template v-slot:label>
                {{ $t('fillingstation') }}
                <b-tooltip type="is-dark" label="Clear selection">
                  <b-button
                    type="is-ghost"
                    size="is-small"
                    icon-pack="fas"
                    icon-right="arrow-rotate-left"
                    @click="clearHeadingProperty('fillingStation')"
                  ></b-button>
                </b-tooltip>
              </template>
              <b-select v-model="fileHeadingMap.fillingStation">
                <option v-for="(option, index) in fileHeadings" :key="index" :value="index">
                  {{ option }}
                </option>
              </b-select>
            </b-field>
            <b-field>
              <template v-slot:label>
                {{ $t('comments') }}
                <b-tooltip type="is-dark" label="Clear selection">
                  <b-button
                    type="is-ghost"
                    size="is-small"
                    icon-pack="fas"
                    icon-right="arrow-rotate-left"
                    @click="clearHeadingProperty('comments')"
                  ></b-button>
                </b-tooltip>
              </template>
              <b-select v-model="fileHeadingMap.comments" type="textarea" multiple expanded>
                <option v-for="(option, index) in fileHeadings" :key="index" :value="index">
                  {{ option }}
                </option>
              </b-select>
            </b-field>
            <br />
            <b-field>
              <b-button tag="button" native-type="submit" type="is-primary" :value="$t('save')" :label="$t('import')" expanded />
              <p v-if="authError"> There was an error logging in to your account. </p>
            </b-field>
          </span>
        </form>
      </div>
    </div>
    <b-message v-if="errors.length" type="is-danger">
      <ul>
        <li v-for="error in errors" :key="error">{{ error }}</li>
      </ul>
    </b-message>
  </Layout>
</template>
