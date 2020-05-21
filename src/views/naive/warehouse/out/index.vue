<template>
  <el-card class="box-card">
    <el-form ref="form" :model="sel_form" label-width="80px" label-position="left" style="margin-top: 2%">
      <el-row :gutter="20">
        <el-col :span="11" :offset="1">
          <el-form-item label="代码">
            <el-input v-model="sel_form.code" />
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item label="名字">
            <el-input v-model="sel_form.name" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="11" :offset="1">
          <el-form-item label="工作部门">
            <el-select v-model="sel_form.workcell_id" style="width: 100%">
              <el-option v-for="item in workcell_list" :key="item.id" :value="item.id" :label="item.workcell" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item label="用途">
            <el-input v-model="sel_form.user_for" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="11" :offset="12">
          <el-button type="primary" icon="el-icon-search">查询</el-button>
          <el-button icon="el-icon-delete" @click="clear_form()">清空</el-button>
          <el-button>导出本页</el-button>
          <el-button>导出全部</el-button>
        </el-col>
      </el-row>
    </el-form>
    <el-divider />
    <el-row :gutter="20" class="tac">
      <el-col :span="6">
        <h5 align="center">存放库位选择</h5>
        <el-menu
          default-active="2"
          class="el-menu-vertical-demo"
        >
          <el-submenu v-for="(item,index) in location_list" :key="item.jig_cabinet_id" :index="index+1+''">
            <template slot="title">
              <i class="el-icon-location" />
              <span>{{ item.jig_cabinet_id }}夹具柜</span>
            </template>
            <el-menu-item-group>
              <template slot="title">存放区域</template>
              <el-menu-item v-for="(location,l_index) in item.location_id" :key="item.jig_cabinet_id+location" :class="{'is-active':item.jig_cabinet_id === jig_cabinet_id && location === jig_location_id}" :index="index+1+''+'-'+l_index+1+''" @click="get_jig_list_by_location(item.jig_cabinet_id,location)">
                <span>{{ location }}</span>
              </el-menu-item>
            </el-menu-item-group>
          </el-submenu>
        </el-menu>
      </el-col>
      <el-col :span="18">
        <el-table
          :data="jig_list"
          border
          style="width: 100%"
        >
          <el-table-column
            prop="code"
            label="工夹具代码"
            width="180"
          />
          <el-table-column
            prop="name"
            label="工夹具名字"
            width="180"
          />
          <el-table-column
            prop="count"
            label="件数"
            width="180"
          />
          <el-table-column
            label="操作"
          >
            <template slot-scope="scope">
              <el-button type="info" @click="get_jig_entity_list(scope.row.code)">查看</el-button>
              <el-button type="primary" @click="get_outgo_jig_info(scope.row.code)">出库</el-button>
              <el-button type="warning">检点</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="block">
          <el-pagination
            :current-page.sync="currentPage"
            :page-sizes="[5, 10, 20, 30]"
            :page-size="10"
            layout="sizes, prev, pager, next"
            :total="1000"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-col>
    </el-row>
    <el-dialog
      title="工夹具信息"
      :visible.sync="show_jig_info"
      width="30%"
      :before-close="handleClose"
    >
      <template v-if="jig_entity_list.length > 0">
        <el-form ref="form" :model="jig_entity" label-width="150px" label-position="left">
          <el-row :gutter="10">
            <el-col :span="20" :offset="2">
              <el-form-item label="选择工夹具">
                <el-select v-model="seq_id" placeholder="选择工夹具">
                  <el-option
                    v-for="item in jig_entity_list"
                    :key="item.seq_id"
                    :label="item.code+'-'+item.seq_id"
                    :value="item.seq_id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="20" :offset="2">
              <el-form-item label="单据号">
                <el-input v-model="jig_entity.bill_no" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="20" :offset="2">
              <el-form-item label="入库时间">
                <el-input v-model="jig_entity.reg_date" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="20" :offset="2">
              <el-form-item label="存放位置">
                <el-input v-if="jig_entity.bin === null" :value="jig_entity.jig_cabinet_id+'-'+jig_entity.location_id" disabled />
                <el-input v-else-if="jig_entity.bin != null" :value="jig_entity.jig_cabinet_id+'-'+jig_entity.location_id+'-'+jig_entity.bin" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="20" :offset="2">
              <el-form-item label="使用次数">
                <el-input v-model="jig_entity.user_for" disabled />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </template>
      <el-divider />
      <span slot="footer" class="dialog-footer">
        <el-button @click="show_jig_info = false">取 消</el-button>
        <el-button type="primary" @click="show_jig_info = false">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="出库"
      :visible.sync="show_outgo_jig"
      width="30%"
      :before-close="handleClose"
    >
      <template v-if="jig_entity_list.length > 0">
        <el-form ref="form" :model="jig_entity" label-width="150px" label-position="left">
          <el-row :gutter="10">
            <el-col :span="20" :offset="2">
              <el-form-item label="选择工夹具">
                <el-select v-model="seq_id" placeholder="选择工夹具">
                  <el-option
                    v-for="item in jig_entity_list"
                    :key="item.seq_id"
                    :label="item.code+'-'+item.seq_id"
                    :value="item.seq_id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="20" :offset="2">
              <el-form-item label="刷卡或输入工号">
                <el-input v-model.trim="user_id" @change="get_user_name" />
              </el-form-item>
              <h6 class="font-success">{{ user_name }} </h6>
            </el-col>
          </el-row>
        </el-form>
      </template>
      <el-divider />
      <span slot="footer" class="dialog-footer">
        <el-button @click="show_outgo_jig = false">取 消</el-button>
        <el-button type="primary" @click="outgo_jig">出库</el-button>
      </span>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  name: 'Index',
  data: function() {
    return {
      currentPage: 1, // 分页所需
      location_list: [],
      jig_list: [],
      jig_entity_list: [], // 同一种code的工夹具实体list
      jig_entity: null, // 工夹具实体
      code: '', // 选择的工夹具code
      seq_id: '', // 选择的工夹具序列号
      show_jig_info: false, // 是否显示查看工夹具的dialog
      show_outgo_jig: false, // 是否显示工夹具出库的dialog
      user_id: '', // 出库工夹具时输入user_id
      check_user_id: false, // 输入user_id是否存在
      user_name: '', // 出库工夹具时输入user_id显示的user_name
      workcell_list: [],
      sel_form: { // 搜索条件
        code: '',
        name: '',
        user_for: '',
        workcell_id: ''
      },
      jig_cabinet_id: '',
      jig_location_id: ''
    }
  },
  computed: {

  },
  watch: {
    seq_id(val) {
      for (var i = 0; i < this.jig_entity_list.length; i++) {
        if (this.seq_id === this.jig_entity_list[i].seq_id) {
          this.jig_entity = this.jig_entity_list[i]
        }
      }
    }
  },
  created() {
    this.get_location_list()
  },
  methods: {
    get_location_list: function() {
      this.$ajax.get('/api/navie/get_location_list', {
        params: {
        }
      }).then(
        response => {
          this.location_list = response.data
        }
      )
    },
    get_jig_list_by_location: function(jig_cabinet, location_id) {
      if (this.jig_cabinet_id === jig_cabinet && this.jig_location_id === location_id) {
        this.jig_cabinet_id = ''
        this.jig_location_id = ''
        this.jig_list = []
        return false
      } else {
        this.jig_cabinet_id = jig_cabinet
        this.jig_location_id = location_id
      }
      this.$ajax.get('//api/navie/get_jig_list_by_location', {
        params: {
          jig_cabinet_id: this.jig_cabinet_id,
          jig_location_id: this.jig_location_id
        }
      }).then(
        responese => {
          this.jig_list = responese.data
        }
      )
    },
    get_jig_entity_list: function(code) {
      this.show_jig_info = true
      this.code = code
      for (var i = 0; i < this.jig_list.length; i++) {
        if (this.jig_list[i].code === code) {
          this.jig_entity_list = this.jig_list[i].jig_entity_list
          break
        }
      }
      if (this.jig_entity_list.length > 0) {
        this.seq_id = this.jig_entity_list[0].seq_id
        this.jig_entity = this.jig_entity_list[0]
      }
    },
    get_outgo_jig_info: function(code) {
      this.show_outgo_jig = true
      this.code = code
      for (var i = 0; i < this.jig_list.length; i++) {
        if (this.jig_list[i].code === code) {
          this.jig_entity_list = this.jig_list[i].jig_entity_list
          break
        }
      }
      if (this.jig_entity_list.length > 0) {
        this.seq_id = this.jig_entity_list[0].seq_id
        this.jig_entity = this.jig_entity_list[0]
      }
    },
    get_user_name: function() { // 出库时输入工号后获取用户名
      this.$ajax.get('/api/get_user_name', {
        params: {
          user_id: this.user_id
        }
      }).then(
        response => {
          if (response.data === null || response.data === '' || response.data.length === 0) {
            this.user_name = '员工不存在!'
          } else {
            this.user_name = response.data
            this.check_user_id = true
          }
        }
      )
    },
    outgo_jig: function() {
      if (this.check_user_id) {
        this.show_outgo_jig = false
        this.$ajax.get('//api/naive/outgo_jig', {
          params: {
            code: this.code,
            seq_id: this.seq_id,
            submit_id: this.user_id
          }
        }).then(
          response => {
            if (response) {
              alert('出库成功！')
              this.user_id = ''
              this.get_jig_list_by_location(this.jig_cabinet_id, this.jig_location_id)
            } else {
              alert('服务器错误！')
            }
          }
        )
      } else {
        alert('工号输入错误!')
      }
    },
    clear_form: function() {
      this.form = {
        code: '',
        name: '',
        workcell_id: '',
        user_for: ''
      }
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`)
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`)
    },
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done()
        })
        .catch(_ => {})
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
