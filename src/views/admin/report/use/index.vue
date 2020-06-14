<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>各类工夹具使用情况分析</span>
      </div>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>历年此类工夹具的使用次数</span>
              <el-select v-model="code" @change="getYearByCode()">
                <el-option v-for="item in codeList" :key="item" :value="item">{{ item }}</el-option>
              </el-select>
            </div>
            <ve-histogram :data="cljj.data" :data-empty="cljj.data.rows.length === 0" :settings="cljj.settings" :extend="mnsycsExtend" />
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>{{ year }}年夹具{{ code }}在各个产线的使用情况</span>
              <el-select v-model="year" @change="getYearByCodeYear()">
                <el-option v-for="n in [2018,2019,2020]" :key="n" :value="n">{{ n }}</el-option>
              </el-select>
            </div>
            <ve-pie :data="ggcx.data" />
          </el-card>
        </el-col>
      </el-row>
    </el-card>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>历年工夹具使用次数</span>
      </div>
      <el-row :gutter="20">
        <el-col :span="16">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>历年工夹具使用次数</span>
            </div>
            <ve-histogram :data="mnsycs" :toolbox="toolbox" :data-zoom="mnsycsDataZoom" :extend="mnsycsExtend" />
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>今年工夹具各个产线的使用占比</span>
            </div>
            <ve-pie :data="zb" :toolbox="toolbox" />
          </el-card>
        </el-col>
      </el-row>
    </el-card>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>历年各条产线的使用次数</span>
      </div>
      <ve-histogram :data="gtcx" :extend="mnsycsExtend" :data-zoom="mnsycsDataZoom" :toolbox="toolbox" />
    </el-card>
  </div>
</template>
<script>
export default {
  name: 'Index',
  data() {
    return {
      codeList: [],
      code: '',

      year: '2020',
      toolbox: {
        feature: {
          saveAsImage: {}
        }
      },
      mnsycs: {
        columns: ['year'],
        rows: []
      },
      mnsycsExtend: {
        series: {
          label: { show: true, position: 'top' }
        },
        yAxis: {
          axisLabel: {
            formatter: '{value}次'
          }
        }
      },
      mnsycsDataZoom: {
        type: 'slider',
        start: 0,
        end: 100
      },
      zb: {
        columns: ['name', 'count'],
        rows: []
      },
      gtcx: {
        columns: ['year'],
        rows: []
      },
      jjgtcxExtend: {
        yAxis: {
          axisLabel: {
            formatter: '{value}次'
          }
        }
      },
      cljj: {
        data: {
          columns: ['year', 'count'],
          rows: []
        },
        settings: {
          labelMap: {
            'count': '次数',
            'year': '年'
          }
        }
      },
      ggcx: {
        data: {
          columns: ['name', 'count'],
          rows: []
        },
        settings: {
          labelMap: {
            'name': '产线',
            'count': '次数'
          }
        }
      }
    }
  },
  created() {
    this.$ajax.get('/api/get_code_list').then(
      response => {
        this.codeList = response.data
        this.code = this.codeList[0]
      }
    )
    setTimeout(() => {
      this.getYearByCode()
      this.getAllYearAllCount()
      this.getYearByCodeYear()
      this.getEveryProductionCount()
      this.getEveryYearProductionLine()
    }, 300)
  }, methods: {
    getYearByCode() {
      this.$ajax.get('/api/report/get_year_by_code', {
        params: {
          code: this.code
        }
      }).then(
        response => {
          this.cljj.data.rows = response.data
        }
      )
      this.getYearByCodeYear()
    },
    getYearByCodeYear() {
      this.$ajax.get('/api/report/get_year_by_code_year', { params: { code: this.code, year: this.year }}).then(
        response => {
          this.ggcx.data.rows = response.data
        }
      )
    },
    getAllYearAllCount() {
      this.$ajax.get('/api/report/get_all_year_all_count').then(
        response => {
          const { data } = response
          const years = []
          data.forEach(
            (v, i) => {
              const { code, year } = v
              if (this.mnsycs.columns.indexOf(code) === -1) {
                this.mnsycs.columns.push(code)
              }
              if (years.indexOf(year) === -1) {
                years.push(year)
              }
            }
          )
          years.forEach(
            (v1, i1) => {
              const item = {}
              item['year'] = v1
              data.forEach(
                (v2, i2) => {
                  if (v2['year'] === v1) {
                    item[v2.code] = v2.count
                  }
                }
              )
              this.mnsycs.rows.push(item)
            }
          )
        }
      )
    },
    getEveryProductionCount() {
      this.$ajax.get('/api/report/get_every_production_count').then(
        response => {
          this.zb.rows = response.data
        }
      )
    },
    getEveryYearProductionLine() {
      this.$ajax.get('/api/report/get_every_year_production_line').then(
        response => {
          const { data } = response
          const years = []
          data.forEach(
            (v, i) => {
              const { name, year } = v
              if (this.gtcx.columns.indexOf(name) === -1) {
                this.gtcx.columns.push(name)
              }
              if (years.indexOf(year) === -1) {
                years.push(year)
              }
            }
          )
          years.forEach(
            (v1, i1) => {
              const item = {}
              item['year'] = v1
              data.forEach(
                (v2, i2) => {
                  if (v2['year'] === v1) {
                    item[v2.name] = v2.count
                  }
                }
              )
              this.gtcx.rows.push(item)
            }
          )
        }
      )
    }
  }
}
</script>

<style scoped>
  .box-card {
    width: 96%;
    margin: 2% 2%
  }

  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }

  .clearfix:after {
    clear: both
  }
</style>
