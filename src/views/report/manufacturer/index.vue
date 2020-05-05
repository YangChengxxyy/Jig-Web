<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="box-card-left">
          <div slot="header" class="clearfix">
            <span>各厂商LRM</span>
          </div>
          <ve-line :data="lrm.data" :colors="lrm.colors" :extend="lrm.extend" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="box-card-right">
          <div slot="header" class="clearfix">
            <span>厂商各维度分析</span>
          </div>
          <ve-pie :data="csbl.data" />
        </el-card>
      </el-col>
    </el-row>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>具体厂商</span>
        <el-select value="A">
          <el-option value="A">A公司</el-option>
        </el-select>
      </div>
      <el-row :gutter="20">
        <el-col :span="16">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>厂商各维度分析</span>
            </div>
            <ve-radar :data="wdfx.data" :extend="wdfx.extend" />
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>往年供货量</span>
            </div>
            <ve-line :data="wnghl.data" :extend="wnghl.extend" />
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Index',
  data() {
    return {
      lrm: {
        data: {
          columns: ['公司', '夹具平均LRM', '最差LRM', '最优LRM'],
          rows: [
            { '公司': 'A公司', '夹具平均LRM': 70, '最差LRM': 50, '最优LRM': 100 },
            { '公司': 'B公司', '夹具平均LRM': 50, '最差LRM': 20, '最优LRM': 80 },
            { '公司': 'C公司', '夹具平均LRM': 85, '最差LRM': 75, '最优LRM': 185 },
            { '公司': 'D公司', '夹具平均LRM': 130, '最差LRM': 60, '最优LRM': 150 }
          ]
        },
        colors: ['#5AB1EF', '#fa6e86', '#5edb9d'],
        extend: {
          series: {
            label: { show: true, position: 'top' }
          },
          title: {
            subtext: 'LRM=(夹具寿命/(夹具维修次数*夹具的价格))'
          }
        }
      },
      csbl: {
        data: {
          columns: ['公司', '数量'],
          rows: [
            { '公司': 'A公司', '数量': '42' },
            { '公司': 'B公司', '数量': '25' },
            { '公司': 'C公司', '数量': '16' },
            { '公司': 'D公司', '数量': '15' }
          ]
        }
      },
      wdfx: {
        data: {
          columns: ['公司', '可靠性', '依赖程度', '夹具质量', '夹具性价比'],
          rows: [
            { '公司': 'A公司', '可靠性': '50', '依赖程度': '97', '夹具质量': '54', '夹具性价比': '90' }
          ]
        },
        extend: {
          radar: {
            indicator: [
              {
                text: '可靠性',
                max: 100
              },
              {
                text: '依赖程度',
                max: 100
              },
              {
                text: '夹具质量',
                max: 100
              },
              {
                text: '夹具性价比',
                max: 100
              }
            ]
          }
        }
      },
      wnghl: {
        data: {
          columns: ['time', '供货量'],
          rows: [
            { 'time': '2012', '供货量': 80 },
            { 'time': '2013', '供货量': 86 },
            { 'time': '2014', '供货量': 93 },
            { 'time': '2015', '供货量': 110 },
            { 'time': '2016', '供货量': 130 },
            { 'time': '2017', '供货量': 102 },
            { 'time': '2018', '供货量': 76 },
            { 'time': '2019', '供货量': 67 }
          ]
        },
        extend: {
          series: {
            label: { show: true, position: 'top' }
          }
        }
      }
    }
  }
}
</script>

<style scoped>
  .box-card{
    width: 96%;
    margin: 2% 2%
  }
  .box-card-left{
    width: 96%;
    margin:2% 0 2% 4%
  }
  .box-card-right{
    width: 96%;
    margin:2% 2% 2% 0
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
