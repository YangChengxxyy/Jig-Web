<template>
  <el-card class="box-card">
    <el-table :data="purchase_submit_list" border style="width: 94%; margin: 1% 3% 2%">
      <el-table-column prop="bill_no" label="采购单据号" />
      <el-table-column prop="submit_name" label="采购人" />
      <el-table-column prop="production_line_name" label="产线" />
      <el-table-column prop="code" label="工夹具代码及其数量">
        <template slot-scope="scope">
          <el-tree :data="getTree(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column prop="submit_time" label="申请时间" />
      <el-table-column label="状态" width="120">
        <template slot-scope="scope">
          <div v-if="scope.row.status === '0'">待入库</div>
          <div v-else-if="scope.row.status === '1'">已入库</div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100%">
        <template slot-scope="scope">
          <el-button type="text" @click="get_input_jig_info(scope.row)">入库</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-if="purchase_submit_list.length !== 0"
      style="text-align: center"
      :current-page="page_number"
      :page-sizes="[5, 10, 20, 30]"
      :page-size="page_size"
      layout="total, sizes, prev, pager, next, jumper"
      :total="all"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    <el-drawer
      ref="input_jig_drawer"
      title="工夹具入库"
      :visible.sync="show_in_jig_drawer"
      direction="rtl"
      :size="'550px'"
      @before-close="clean_in_jig_form()"
    >
      <el-form ref="in_jig_form" label-width="100px" label-position="left" :model="in_jig_form">
        <el-row>
          <el-col :span="20" :offset="2">
            <el-form-item label="单据号">
              <el-input v-model="in_jig_form.bill_no" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20" :offset="2">
            <el-divider />
          </el-col>
        </el-row>
        <el-row v-for="(item,index) in in_jig_form.code" :key="index" :gutter="10">
          <el-col :span="9" :offset="2">
            <el-form-item
              :label="'工夹具代码'+(index+1)"
              label-width="100px"
              :prop="'code['+index+']'"
            >
              <el-input v-model="in_jig_form.code[index]" type="text" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item
              label="数量"
              label-width="50px"
              style="width: 100%"
              :prop="'count['+index+']'"
            >
              <el-input
                v-model.number="in_jig_form.count[index]"
                controls-position="right"
                size="medium"
                style="width: 100%"
                readonly
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="2">
            <el-form-item
              label="存放位置"
              :rules="[{required:true,message:'存放位置不得为空',trigger:'change'}]"
              :prop="'jig_position['+index+']'"
            >
              <el-cascader
                v-model="in_jig_form.jig_position[index]"
                :options="warehouse_label"
                separator="-"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20" :offset="2">
            <el-divider />
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20" :offset="2">
            <el-form-item>
              <el-button style="width: 48%" @click="show_in_jig_drawer = false">取 消</el-button>
              <template>
                <el-popconfirm
                  title="确定要添加采购入库的工夹具吗？"
                  @onConfirm="input_jig('in_jig_form')"
                >
                  <el-button slot="reference" type="primary" style="width: 48%">确 定</el-button>
                </el-popconfirm>
              </template>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-drawer>
  </el-card>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  name: 'Index',
  data: function() {
    return {
      purchase_submit_list: [],
      show_in_jig_drawer: false,
      in_jig_form: {
        bill_no: '',
        code: [''],
        count: [1],
        jig_position: ['']
      },
      warehouse: [],
      warehouse_label: [],
      page_size: 10,
      page_number: 1,
      all: 0
    }
  },
  computed: {
    ...mapGetters([
      'id',
      'workcell_id',
      'token'
    ])
  },
  created() {
    this.get_purchase_submit_list()
    this.get_warehouse()
  },
  methods: {
    get_purchase_submit_list: function() {
      this.$ajax.get('/api/naive/get_pending_purchase_submit_list', {
        params: {
          workcell_id: this.workcell_id,
          page_number: this.page_number,
          page_size: this.page_size
        }
      }).then(
        response => {
          this.purchase_submit_list = response.data.data
          this.all = response.data.all
        }
      )
    },
    input_jig: function(form_name) {
      this.$refs[form_name].validate((valid) => {
        if (valid) {
          this.$ajax.get('/api/naive/input_purchase_submit_jig', {
            params: {
              bill_no: this.in_jig_form.bill_no,
              code: this.in_jig_form.code.join('|'),
              count: this.in_jig_form.count.join('|'),
              jig_position: this.in_jig_form.jig_position.join('|'), // 格式 7,A2|8,C1
              user_id: this.id
            }
          }).then(
            response => {
              if (response.data > 0) {
                this.$message.success('入库成功!')
                this.show_in_jig_drawer = false
                this.clean_in_jig_form()
                this.get_purchase_submit_list()
              } else {
                this.$message.error('服务器错误!')
              }
            }
          )
        } else {
          return false
        }
      })
    },
    get_input_jig_info: function(purchase_submit) {
      this.in_jig_form.bill_no = purchase_submit.bill_no
      this.in_jig_form.code = purchase_submit.code.split('|')
      this.in_jig_form.count = purchase_submit.count.split('|')
      this.show_in_jig_drawer = true
    },
    get_warehouse: function() {
      this.$ajax.get('/api/get_jig_cabinet_list', {}).then(
        res => {
          this.warehouse = res.data
          this.get_warehouse_label()
        }
      )
    },
    get_warehouse_label: function() {
      this.warehouse_label = []
      for (var i = 0; i < this.warehouse.length; i++) { // 将warehouse数据结构转换成适用于级联选择器的数据结构
        this.warehouse_label.push({
          value: this.warehouse[i].jig_cabinet_id,
          label: this.warehouse[i].jig_cabinet_id,
          children: []
        })
        for (var j = 0; j < this.warehouse[i].location_id_list.length; j++) {
          this.warehouse_label[i].children.push({
            value: this.warehouse[i].location_id_list[j].location_id,
            label: this.warehouse[i].location_id_list[j].location_id
          })
        }
      }
    },
    getTree: function(row) { // 获取采购审批的工夹具及其数量树形图
      const a = []
      const codes = row.code.split('|')
      const counts = row.count.split('|')
      codes.forEach((v, i) => {
        a.push({ label: v + ' - ' + counts[i] + '件', children: null })
      })
      return a
    },
    handleSizeChange: function(val) {
      this.page_size = val
      this.get_purchase_submit_list()
    },
    handleCurrentChange: function(val) {
      this.page_number = val
      this.get_purchase_submit_list()
    },
    clean_in_jig_form: function() {
      this.in_jig_form = {
        bill_no: '',
        code: [''],
        count: [1],
        jig_position: ['']
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
  .font-success{
    color: #67C23A;
  }
  .font-error{
    color: #F56C6C;
  }
  .font-warning{
    color: #E6A23C;
  }
  .font-info{
    color: #909399;
  }
</style>
