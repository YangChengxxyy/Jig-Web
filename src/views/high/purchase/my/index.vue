<template>
  <el-card class="box-card">
    <el-row :gutter="20">
      <el-col :span="22" :offset="1">
        <el-button type="primary" style="margin-top: 1%" @click="showPurchase('添加采购单')">
          添加采购单
        </el-button>
        <el-divider />
        <el-table :data="purchase_income_submit_list" border>
          <el-table-column label="采购单据号" prop="bill_no" />
          <el-table-column label="采购人" prop="submit_name" />
          <el-table-column label="产线" prop="production_line_name" />
          <el-table-column label="工夹具代码及数量">
            <template slot-scope="scope">
              <el-tree :data="getTree(scope.row)" />
            </template>
          </el-table-column>
          <el-table-column label="申请时间" prop="submit_time" />
          <el-table-column label="状态">
            <template slot-scope="scope">
              <span v-if="scope.row.status === '0'" class="font-warning">待初审</span>
              <span v-else-if="scope.row.status === '1'" class="font-error">初审未通过</span>
              <span v-else-if="scope.row.status === '2'" class="font-success">初审通过</span>
              <span v-else-if="scope.row.status === '3'" class="font-error">终审未通过</span>
              <span v-else class="font-success">终审通过</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100%">
            <template slot-scope="scope">
              <el-button v-if="scope.row.status === '0'" type="text" :disabled="scope.row.status !== '0'" @click="showPurchase('修改采购单',scope.row)">修改</el-button>
              <el-button v-else type="text" @click="get_purchase_submit(scope.row)">查看</el-button>
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
        <el-divider />
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
      </el-col>
    </el-row>
    <el-drawer ref="drawer" :title="drawerTitle" :visible.sync="drawerVisible" direction="rtl" :size="'550px'" @before-close="clean('add')">
      <el-form ref="adds" label-width="100px" label-position="left" :model="form">
        <el-row>
          <el-col :span="20" :offset="2">
            <el-form-item label="单据号" :rules="[{required: true,message:'请填写单据号',trigger: 'change'}]" prop="bill_no">
              <el-input v-model="form.bill_no" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20" :offset="2">
            <el-form-item label="采购人id" :rules="[{required: true,message:'请填写采购人id',trigger: 'change'}]" prop="submit_id">
              <el-input v-model="form.submit_id" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="11" :offset="2">
            <el-form-item label="产线" :rules="[{required: true,message:'请选择产线',trigger: 'change'}]" prop="production_line_id">
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
            <el-form-item :label="'工夹具代码'+(index+1)" label-width="100px" :rules="[{required:true,message:'此项不得为空',trigger:'change'}]" :prop="'code['+index+']'">
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
                {type: 'number',min: 1,message: '不得小于1',trigger: 'change'}]"
              :prop="'count['+index+']'"
            >
              <el-input-number v-model.number="form.count[index]" controls-position="right" size="medium" style="width: 100%" />
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
    <el-dialog title="采购入库申请明细" :visible.sync="show_purchase_submit_detail_dialog" width="40%">
      <el-form v-if="purchase_submit_detail != null" ref="form" :model="purchase_submit_detail" label-width="100px" label-position="left">
        <el-row :gutter="10">
          <el-col :span="22" :offset="1">
            <el-form-item label="单据号">
              <el-input v-model.trim="purchase_submit_detail.bill_no" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="22" :offset="1">
            <el-form-item label="采购人">
              <el-input v-model.trim="purchase_submit_detail.submit_name" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="22" :offset="1">
            <el-form-item label="产线">
              <el-input v-model.trim="purchase_submit_detail.production_line_name" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-for="(item,index) in purchase_submit_detail.code.split('|')" :key="index" :gutter="10">
          <el-col :span="11" :offset="1">
            <el-form-item label="工夹具代码">
              <el-input :value="item" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="数量">
              <el-input :value="purchase_submit_detail.count.split('|')[index]" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="22" :offset="1">
            <el-form-item label="申请时间">
              <el-input v-model.trim="purchase_submit_detail.submit_time" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="22" :offset="1">
            <el-form-item label="审批状态">
              <el-input v-if="purchase_submit_detail.status === '0'" class="input-warning" value="待初审" readonly />
              <el-input v-else-if="purchase_submit_detail.status === '1'" class="input-error" value="初审未通过" readonly />
              <el-input v-else-if="purchase_submit_detail.status === '2'" class="input-success" value="初审通过" readonly />
              <el-input v-else-if="purchase_submit_detail.status === '3'" class="input-error" value="终审未通过" readonly />
              <el-input v-else class="input-success" value="终审通过" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="purchase_submit_detail.status === '1'" :gutter="10">
          <el-col :span="22" :offset="1">
            <el-form-item label="不通过的原因">
              <el-input v-model.trim="purchase_submit_detail.first_reason" type="textarea" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="purchase_submit_detail.first_acceptor_name != null" :gutter="10">
          <el-col :span="22" :offset="1">
            <el-form-item label="初审人">
              <el-input v-model.trim="purchase_submit_detail.first_acceptor_name" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="purchase_submit_detail.first_time != null" :gutter="10">
          <el-col :span="22" :offset="1">
            <el-form-item label="初审时间">
              <el-input v-model.trim="purchase_submit_detail.first_time" readonly />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-dialog>
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
      drawerTitle: '',
      show_purchase_submit_detail_dialog: false,
      purchase_submit_detail: null
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
    },
    '$route.query.id': {
      handler() {
        const id = this.$route.query['id']
        if (id !== undefined) {
          this.$ajax.get('/api/get_a_purchase_submit', { params: { id: id }}).then((response) => {
            this.purchase_submit_detail = response.data
            this.show_purchase_submit_detail_dialog = true
          })
        }
      }
    }
  },
  created() {
    this.getData()
    const id = this.$route.query['id']
    if (id !== undefined) {
      this.$ajax.get('/api/get_a_purchase_submit', { params: { id: id }}).then((response) => {
        this.purchase_submit_detail = response.data
        this.show_purchase_submit_detail_dialog = true
      })
    }
    this.$ajax('/api/get_production_line_list').then(
      res => {
        this.production_line_list = res.data
      }
    )
    this.$ajax('/api/get_code_list').then(
      res => {
        this.all_code_list = res.data
        this.code_list = res.data
      }
    )
  },
  methods: {
    getData() {
      this.$ajax.get('/api/high/get_purchase_income_submit_list', {
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
    get_purchase_submit: function(purchase_submit) {
      this.purchase_submit_detail = purchase_submit
      this.show_purchase_submit_detail_dialog = true
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
      this.$ajax('/api/code_get_in_seq_id', {
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
        this.$refs['adds'].validate(
          (valid) => {
            if (valid) {
              this.$ajax('/api/high/add_shoplist', {
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
        this.$refs['adds'].validate(
          (valid) => {
            if (valid) {
              this.$ajax('/api/high/update_purchase_income_submit', {
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
      this.$ajax.get('/delete_purchase_submit', { params: { id: this.id }}).then()
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
  .input-success >>> input{
    color: #67C23A;
  }
  .input-error >>> input{
    color: #F56C6C;
  }
  .input-warning >>> input{
    color: #E6A23C;
  }
  .input-info >>> input{
    color: #909399;
  }
</style>
