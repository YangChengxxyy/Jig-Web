<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="box-card-left">
          <div slot="header" class="clearfix">
            <span>总体寿命分布图</span>
          </div>
          <ve-histogram
            :data="allLife"
            :toolbox="toolbox"
            :extend="allLeftExtend"
            :data-zoom="dataZoom"
            :settings="allLife.settings"
          />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="box-card-right">
          <div slot="header" class="clearfix">
            <span>每条产线的平均夹具寿命</span>
          </div>
          <ve-line :data="everyLeft" :toolbox="toolbox" :data-zoom="dataZoom" />
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="box-card-left">
          <div slot="header" class="clearfix">
            <span>工夹具损坏占比统计</span>
          </div>
          <ve-pie :data="repairZb" :toolbox="toolbox" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="box-card-right">
          <div slot="header" class="clearfix">
            <span>各厂商的损坏统计</span>
          </div>
          <ve-histogram :data="repairCSTJ" :toolbox="toolbox" :extend="allLeftExtend" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script>
export default {
  name: 'Index',
  data: function() {
    return {
      toolbox: {
        feature: {
          saveAsImage: {}
        }
      },
      allLife: {
        columns: ['range', 'count'],
        rows: [
          { 'range': '<1000', 'count': 0 },
          { 'range': '1000~3000', 'count': 0 },
          { 'range': '3000~5000', 'count': 0 },
          { 'range': '5000~7000', 'count': 0 },
          { 'range': '>7000', 'count': 0 }
        ],
        settings: {
          labelMap: {
            'count': '工夹具数量'
          }
        }
      },
      allLeftExtend: {
        yAxis: {
          axisLabel: {
            formatter: '{value}件'
          }
        }
      },
      everyLeft: {
        columns: ['range', '一号产线', '二号产线', '三号产线', '四号产线'],
        rows: [
          { 'range': '<1000', '一号产线': '9', '二号产线': '3', '三号产线': '2', '四号产线': '6' },
          { 'range': '1000~3000', '一号产线': '14', '二号产线': '17', '三号产线': '19', '四号产线': '21' },
          { 'range': '3000~5000', '一号产线': '30', '二号产线': '23', '三号产线': '25', '四号产线': '33' },
          { 'range': '5000~7000', '一号产线': '37', '二号产线': '31', '三号产线': '32', '四号产线': '44' },
          { 'range': '>7000', '一号产线': '1', '二号产线': '3', '三号产线': '5', '四号产线': '9' }
        ]
      },
      dataZoom: {
        type: 'slider',
        start: 0,
        end: 100
      },
      repairZb: {
        columns: ['name', 'count'],
        rows: [
          { '分类': '外观磨损', '数量': 22 },
          { '分类': '夹具磨损', '数量': 21 },
          { '分类': '零件掉落', '数量': 33 },
          { '分类': '失去精准度', '数量': 26 }
        ]
      },
      repairCSTJ: {
        // columns: ['分类', 'A公司', 'B公司'],
        columns: ['name'],
        // rows: [
        //   { '分类': '外观磨损', 'A公司': '15', 'B公司': '30' },
        //   { '分类': '夹具磨损', 'A公司': '20', 'B公司': '22' },
        //   { '分类': '零件掉落', 'A公司': '45', 'B公司': '24' },
        //   { '分类': '失去精准度', 'A公司': '37', 'B公司': '14' }
        // ]
        rows: []
      }
    }
  },
  created() {
    this.getLifeTotal()
    this.getRepairReason()
    this.getRepairManufacturer()
  },
  methods: {
    getLifeTotal() {
      this.$ajax.get('/api/report/get_life_total').then(
        response => {
          const { data } = response
          data.forEach(
            (v, i) => {
              if (v['count'] < 1000) {
                this.allLife.rows.forEach(
                  (v2, i2) => {
                    if (v2.range === '<1000') {
                      v2.count++
                    }
                  }
                )
              } else if (v['count'] < 3000) {
                this.allLife.rows.forEach(
                  (v2, i2) => {
                    if (v2.range === '1000~3000') {
                      v2.count++
                    }
                  }
                )
              } else if (v['count'] < 5000) {
                this.allLife.rows.forEach(
                  (v2, i2) => {
                    if (v2.range === '3000~5000') {
                      v2.count++
                    }
                  }
                )
              } else if (v['count'] < 7000) {
                this.allLife.rows.forEach(
                  (v2, i2) => {
                    if (v2.range === '5000~7000') {
                      v2.count++
                    }
                  }
                )
              } else {
                this.allLife.rows.forEach(
                  (v2, i2) => {
                    if (v2.range === '>7000') {
                      v2.count++
                    }
                  }
                )
              }
            }
          )
        }
      )
    },
    getRepairReason() {
      this.$ajax.get('/api/report/get_repair_reason').then(
        response => {
          this.repairZb.rows = response.data
        }
      )
    },
    getRepairManufacturer() {
      this.$ajax.get('/api/report/get_repair_manufacturer').then(
        response => {
          const { data } = response
          console.log(data)
          const names = []
          data.forEach(
            (v, i) => {
              const { company, name } = v
              if (this.repairCSTJ.columns.indexOf(company) === -1) {
                this.repairCSTJ.columns.push(company)
              }
              if (names.indexOf(name) === -1) {
                names.push(name)
              }
            }
          )
          console.log(names)
          names.forEach(
            (v1, i1) => {
              const item = {}
              item['name'] = v1
              data.forEach(
                (v2, i2) => {
                  if (v2['name'] === v1) {
                    item[v2['company']] = v2.count
                  }
                }
              )
              this.repairCSTJ.rows.push(item)
            }
          )
          console.log(this.repairCSTJ.rows)
        }
      )
    }
  }
}
</script>

<style scoped>
  .box-card-left {
    width: 96%;
    margin: 2% 0 2% 4%
  }

  .box-card-right {
    width: 96%;
    margin: 2% 2% 2% 0
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
