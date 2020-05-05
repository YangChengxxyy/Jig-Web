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
              <el-select value="EF0789">
                <el-option value="EF0789">EF2078</el-option>
              </el-select>
            </div>
            <ve-line :data="cljj.data" />
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>2014年夹具EF2078在各个产线的使用情况</span>
              <el-select value="2014">
                <el-option value="2014">2014</el-option>
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
            <ve-histogram :data="mnsycs" :extend="mnsycsExtend" :toolbox="toolbox" :data-zoom="mnsycsDataZoom" />
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
      <ve-line :data="gtcx" :extend="mnsycsExtend" :data-zoom="mnsycsDataZoom" :toolbox="toolbox" />
    </el-card>
  </div>
</template>
<script>
export default {
  name: 'Index',
  data() {
    return {
      toolbox: {
        feature: {
          saveAsImage: {}
        }
      },
      mnsycs: {
        columns: ['时间', 'EF0789', 'EF0273', 'EF0972'],
        rows: [
          { '时间': '2012', 'EF0789': 180, 'EF0273': 180, 'EF0972': 380 },
          { '时间': '2013', 'EF0789': 270, 'EF0273': 210, 'EF0972': 310 },
          { '时间': '2014', 'EF0789': 210, 'EF0273': 45, 'EF0972': 150 },
          { '时间': '2015', 'EF0789': 180, 'EF0273': 570, 'EF0972': 230 },
          { '时间': '2016', 'EF0789': 100, 'EF0273': 170, 'EF0972': 230 },
          { '时间': '2017', 'EF0789': 123, 'EF0273': 190, 'EF0972': 310 },
          { '时间': '2018', 'EF0789': 256, 'EF0273': 110, 'EF0972': 380 },
          { '时间': '2019', 'EF0789': 89, 'EF0273': 423, 'EF0972': 240 }
        ]
      },
      mnsycsExtend: {
        series: {
          barWidth: '23%',
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
        columns: ['产线', '使用次数'],
        rows: [
          { '产线': '一号产线', '使用次数': '2012' },
          { '产线': '二号产线', '使用次数': '2912' },
          { '产线': '三号产线', '使用次数': '1012' },
          { '产线': '四号产线', '使用次数': '412' },
          { '产线': '其他', '使用次数': '12' }
        ]
      },
      gtcx: {
        columns: ['时间', '一号产线', '二号产线', '三号产线'],
        rows: [
          { '时间': '2004', '一号产线': 256, '二号产线': 45, '三号产线': 380 },
          { '时间': '2005', '一号产线': 270, '二号产线': 210, '三号产线': 310 },
          { '时间': '2006', '一号产线': 210, '二号产线': 180, '三号产线': 500 },
          { '时间': '2007', '一号产线': 180, '二号产线': 57, '三号产线': 230 },
          { '时间': '2008', '一号产线': 100, '二号产线': 230, '三号产线': 170 },
          { '时间': '2009', '一号产线': 123, '二号产线': 190, '三号产线': 310 },
          { '时间': '2010', '一号产线': 180, '二号产线': 110, '三号产线': 380 },
          { '时间': '2011', '一号产线': 89, '二号产线': 423, '三号产线': 240 },
          { '时间': '2012', '一号产线': 180, '二号产线': 180, '三号产线': 380 },
          { '时间': '2013', '一号产线': 270, '二号产线': 210, '三号产线': 310 },
          { '时间': '2014', '一号产线': 210, '二号产线': 45, '三号产线': 150 },
          { '时间': '2015', '一号产线': 180, '二号产线': 570, '三号产线': 230 },
          { '时间': '2016', '一号产线': 100, '二号产线': 170, '三号产线': 230 },
          { '时间': '2017', '一号产线': 123, '二号产线': 190, '三号产线': 310 },
          { '时间': '2018', '一号产线': 256, '二号产线': 110, '三号产线': 380 },
          { '时间': '2019', '一号产线': 89, '二号产线': 423, '三号产线': 240 }
        ]
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
          columns: ['time', '次数'],
          rows: [
            { 'time': '2012', '次数': 25 },
            { 'time': '2013', '次数': 30 },
            { 'time': '2014', '次数': 45 },
            { 'time': '2015', '次数': 25 },
            { 'time': '2016', '次数': 37 },
            { 'time': '2017', '次数': 5 },
            { 'time': '2018', '次数': 20 },
            { 'time': '2019', '次数': 12 }
          ]
        }
      },
      ggcx: {
        data: {
          columns: ['产线', '次数'],
          rows: [
            { '产线': '一号产线', '次数': 12 },
            { '产线': '二号产线', '次数': 4 },
            { '产线': '三号产线', '次数': 7 },
            { '产线': '四号产线', '次数': 2 }
          ]
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
  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }
  .clearfix:after {
    clear: both
  }
</style>
