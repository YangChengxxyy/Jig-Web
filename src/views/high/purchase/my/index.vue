<template>
  <el-card class="box-card">
    <el-button type="primary" style="margin-left: 3%;margin-top: 2%" @click="showPurchase('添加采购单')">
      添加采购单
    </el-button>
    <el-table :data="purchase_income_submit_list" border style="width: 94%; margin: 1% 3% 2%">
      <el-table-column label="采购单据号" prop="bill_no" />
      <el-table-column label="采购人" prop="submit_name" />
      <el-table-column label="产线" prop="production_line_name" />
      <el-table-column label="工夹具代码及数量">
        <template slot-scope="scope">
          <el-tree :data="getTree(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="状态">
        <template slot-scope="scope">
          <span v-if="scope.row.status === '0'">待初审</span>
          <span v-else-if="scope.row.status === '1'">初审未通过</span>
          <span v-else-if="scope.row.status === '2'">初审通过</span>
          <span v-else-if="scope.row.status === '3'">终审未通过</span>
          <span v-else>终审通过</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100%">
        <template slot-scope="scope">
          <el-button type="text" :disabled="scope.row.status !== '0'" @click="showPurchase('修改采购单',scope.row)">修改</el-button>
          <el-popconfirm
            confirm-button-text="确定"
            cancel-button-text="不用"
            icon="el-icon-info"
            icon-color="red"
            title="确定删除这条记录？"
            @onConfirm="del(scope.row)"
          >
            <el-button slot="reference" :disabled="scope.row.status !== '0'" type="text">删除</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-if="purchase_income_submit_list.length !== 0"
      style="text-align: center"
      :current-page="page_number"
      :page-sizes="[5, 10, 20, 30]"
      :page-size="page_size"
      layout="total, sizes, prev, pager, next, jumper"
      :total="all"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    <el-drawer ref="drawer" :title="drawerTitle" :visible.sync="drawerVisible" direction="rtl" :size="'550px'" @before-close="clean('add')">
      <el-form ref="add" label-width="100px" label-position="left" :model="form">
        <el-row>
          <el-col :span="20" :offset="2">
            <el-form-item label="单据号" :rules="[{required: true,message:'请填写单据号',trigger: 'blur'}]">
              <el-input v-model="form.bill_no" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20" :offset="2">
            <el-form-item label="采购人id" :rules="[{required: true,message:'请填写采购人id',trigger: 'blur'}]">
              <el-input v-model="form.submit_id" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="11" :offset="2">
            <el-form-item label="产线" :rules="[{required: true,message:'请选择产线',trigger: 'blur'}]">
              <el-select v-model="form.production_line_id">
                <el-option v-for="item in production_line_list" :key="item.id" :value="item.id" :label="item.name" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="5" :offset="4">
            <el-button type="danger" icon="el-icon-delete" @click="clean('add')">清 空</el-button>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20" :offset="2">
            <el-divider />
          </el-col>
        </el-row>
        <el-row v-for="(item,index) in form.code" :key="index" :gutter="10">
          <el-col :span="9" :offset="2">
            <el-form-item :label="'工夹具代码'+(index+1)" label-width="100px" :rules="[{required:true,message:'此项不得为空',trigger:'blur'}]">
              <el-select v-model="form.code[index]">
                <el-option v-for="item2 in code_list" :key="item2" :value="item2" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item
              label="数量"
              label-width="50px"
              style="width: 100%"
              :rules="[
                {required: true,message :'此项不得为空',trigger: 'blur'},
                {min: 1,message: '不得小于1',trigger: 'change'}]"
            >
              <el-input-number v-model="form.count[index]" controls-position="right" size="medium" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-button icon="el-icon-minus" circle @click="reduce(index)" />
            <el-button v-if="index === form.code.length-1" icon="el-icon-plus" circle @click="add" />
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20" :offset="2">
            <el-divider />
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20" :offset="2">
            <el-button style="width: 48%" @click="cancel('drawer')">取 消</el-button>
            <el-button type="primary" style="width: 48%" @click="submitPurchase(drawerTitle)">确 定</el-button>
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
  data() {
    return {
      purchase_income_submit_list: [],
      page_number: 1,
      page_size: 10,
      all: 0,
      all_code_list: [],
      code_list: [],
      drawerVisible: false,
      production_line_list: [],
      form: {
        id: '',
        bill_no: '',
        submit_id: '',
        production_line_id: '',
        code: [''],
        count: [1]
      },
      drawerTitle: ''
    }
  },
  computed: {
    ...mapGetters([
      'id'
    ])
  },
  watch: {
    form: {
      handler(newValue, oldValue) {
        this.code_list = this.all_code_list
        newValue.code.forEach(
          (v, i) => {
            this.code_list = this.code_list.filter(
              (item) => {
                return item !== v
              })
          })
      },
      deep: true
    }
  },
  created() {
    this.getData()
    this.$ajax('/get_production_line_list').then(
      res => {
        this.production_line_list = res.data
      }
    )
    this.$ajax('/get_code_list').then(
      res => {
        this.all_code_list = res.data
        this.code_list = res.data
      }
    )
  },
  methods: {
    getData() {
      this.$ajax('/high/get_purchase_income_submit_list', {
        params: {
          page_number: this.page_number,
          page_size: this.page_size
        }
      }).then(
        response => {
          const { data } = response
          this.purchase_income_submit_list = data.data
          this.all = data.all
          if (data.all === 0) {
            this.$message.info('查询暂无结果')
          } else {
            this.$message.success('查询到' + data.all + '条记录')
          }
        }
      )
    },
    showPurchase: function(title, row = { bill_no: '', submit_id: '', production_line_id: '', code: [''], count: [1] }) {
      this.drawerTitle = title
      if (title === '添加采购单') {
        this.form = row
      } else {
        const a = JSON.parse(JSON.stringify(row))// 防止指针错误
        const { code, count } = a
        // const { code, count } = row
        this.form = a
        this.form.code = code.split('|')
        this.form.count = count.split('|')
      }
      this.drawerVisible = true
    },
    /**
       * 页面大小改变事件
       * @param val
       */
    handleSizeChange: function(val) {
      this.page_size = val
      this.getData()
    },
    /**
       * 页码改变事件
       * @param val
       */
    handleCurrentChange: function(val) {
      this.page_number = val
      this.getData()
    },
    get_seq_id_list: function() {
      this.$ajax('/code_get_in_seq_id', {
        params: {
          code: this.form.code
        }
      }).then(
        response => {
          this.seq_id_list = response.data
        }
      )
    },
    submitPurchase(drawerTitle) {
      if (drawerTitle === '添加采购单') {
        this.$refs['add'].validate(
          (valid) => {
            if (valid) {
              this.$ajax('/high/add_shoplist', {
                params: {
                  bill_no: this.form.bill_no,
                  submit_id: this.form.submit_id,
                  production_line_id: this.form.production_line_id,
                  code: this.form.code.join('|'),
                  count: this.form.count.join('|')
                }
              }).then(
                response => {
                  const { data } = response
                  if (data) {
                    this.$message.success('添加成功')
                    this.getData()
                    this.$refs['add'].resetFields()
                    this.$refs['drawer'].closeDrawer()
                  } else {
                    this.$message.error('服务器错误')
                  }
                }
              )
            }
          })
      } else {
        this.$refs['add'].validate(
          (valid) => {
            if (valid) {
              this.$ajax('/high/update_purchase_income_submit', {
                params: {
                  id: this.form.id,
                  production_line_id: this.form.production_line_id,
                  code: this.form.code.join('|'),
                  count: this.form.count.join('|')
                }
              }).then(
                response => {
                  if (response.data) {
                    this.$message.success('修改成功')
                    this.getData()
                    this.$refs['add'].resetFields()
                    this.$refs['drawer'].closeDrawer()
                  } else {
                    this.$message.error('服务器错误')
                  }
                }
              )
            }
          })
      }
    },
    del: function(row) {
      // TODO:向后台请求删除，后台需要修改
    },
    getTree: function(row) {
      const a = []
      const codes = row.code.split('|')
      const counts = row.count.split('|')
      codes.forEach((v, i) => {
        a.push({ label: v + ' - ' + counts[i] + '件', children: null })
      })
      return a
    },
    reduce(n) {
      if (this.form.code.length > 1) {
        this.form.code.splice(n, 1)
        this.form.count.splice(n, 1)
      }
    },
    add() {
      if (this.form.code.length !== 4) {
        this.form.code.push('')
        this.form.count.push(1)
      } else if (this.form.code.length === 4) {
        this.$message.warning('至多选择四项工夹具')
      }
    },
    clean(formName) {
      this.form = {
        bill_no: '',
        submit_id: '',
        production_line_id: '',
        code: [''],
        count: [1]
      }
    },
    cancel(drawer) {
      this.$refs[drawer].closeDrawer()
    }
  }
}
</script>

<style scoped>
  .box-card {
    width: 96%;
    margin: 2% 2%
  }
</style>
