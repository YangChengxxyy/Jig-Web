<template>
  <el-card class="box-card">
    <el-form ref="form" :model="sel_form" label-width="80px" label-position="left" style="margin-top: 2%">
      <el-row :gutter="20">
        <el-col :span="11" :offset="1">
          <el-form-item label="代码">
            <el-input v-model.trim="sel_form.code" />
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item label="名字">
            <el-input v-model.trim="sel_form.name" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="11" :offset="1">
          <el-form-item label="工作部门">
            <el-select v-model.trim="sel_form.workcell_id" style="width: 100%">
              <el-option v-for="item in workcell_list" :key="item.id" :value="item.id" :label="item.workcell" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item label="用途">
            <el-input v-model.trim="sel_form.user_for" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="11" :offset="1">
          <el-button type="primary" @click="show_add_family = true">添加类别</el-button>
        </el-col>
        <el-col :span="11">
          <el-button type="primary" icon="el-icon-search" @click="get_jig_definition_list">查询</el-button>
          <el-button icon="el-icon-delete" @click="clear_form()">清空</el-button>
        </el-col>
      </el-row>
    </el-form>
    <el-divider />
    <el-row :gutter="20" class="tac">
      <el-col :span="6">
        <h5 align="center"><i class="el-icon-menu" />工夹具类别</h5>
        <el-menu
          default-active="2"
          class="el-menu-vertical-demo"
        >
          <el-menu-item v-for="(item,index) in jig_family_list" :id="'jig_family_'+item.family" :key="'jig_family_'+item.family" :index="index+1+''" @click="get_jig_family(item)">
            <template slot="title">
              <i class="el-icon-s-tools" />
              <span>{{ item.family }}</span>
            </template>
          </el-menu-item>
        </el-menu>
      </el-col>
      <el-col :span="18">
        <el-table :data="jig_definition_list" border style="width: 100%">
          <el-table-column prop="code" label="工夹具代码" width="180" />
          <el-table-column prop="name" label="名字" width="180" />
          <el-table-column prop="model" label="模组" width="120" />
          <el-table-column prop="user_for" label="用途" width="240" />
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" @click="get_jig_definition(scope.row)">编辑</el-button>
              <!-- <el-popconfirm
                title="确定删除该工夹具信息吗？"
                icon-color="red"
              >
                <el-button slot="reference" type="danger">删除</el-button>
              </el-popconfirm> -->
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-if="jig_definition_list.length !== 0"
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
    <el-dialog title="编辑工夹具" :visible.sync="show_edit_dialog" width="40%">
      <el-form v-if="jig_definition != null" ref="form" :model="jig_definition" label-width="150px" label-position="left">
        <el-row :gutter="10">
          <el-col :span="20" :offset="2">
            <el-form-item label="工夹具代码">
              <el-input v-model.trim="jig_definition.code" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="20" :offset="2">
            <el-form-item label="工夹具名字">
              <el-input v-model.trim="jig_definition.name" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="20" :offset="2">
            <el-form-item label="所属部门">
              <el-select v-model="jig_definition.workcell_id" style="width: 100%">
                <el-option v-for="item in workcell_list" :key="'jd-workcell-'+item.id" :value="item.id" :label="item.workcell" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="20" :offset="2">
            <el-form-item label="工夹具类别">
              <el-select v-model="jig_definition.family" style="width: 100%">
                <el-option v-for="item in jig_family_list" :key="'jd-family-'+item.id" :value="item.id" :label="item.family" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="20" :offset="2">
            <el-form-item label="工夹具模组">
              <el-select v-model="jig_definition.model" style="width: 100%">
                <el-option v-for="item in model_list" :key="'jd-model-'+item.model" :value="item.model" :label="item.model" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="20" :offset="2">
            <el-form-item label="工夹具料号">
              <el-select v-model="edit_jig_part_no" multiple placeholder="请选择料号" style="width: 100%">
                <el-option v-for="item in part_no_list" :key="'part_no-'+item.id" :label="item.part_no" :value="item.part_no" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="20" :offset="2">
            <el-form-item label="用途">
              <el-input v-model.trim="jig_definition.user_for" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="20" :offset="2">
            <el-form-item label="每条产线所需">
              <el-input v-model.trim="jig_definition.upl" type="number" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="20" :offset="2">
            <el-form-item label="检点周期">
              <el-input v-model.trim="jig_definition.pm_period" type="number" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="20" :offset="2">
            <el-form-item label="责任人">
              <el-input v-model.trim="jig_definition.owner_name" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="20" :offset="2">
            <el-form-item label="录入人">
              <el-input v-model.trim="jig_definition.rec_by_name" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="20" :offset="2">
            <el-form-item label="录入时间">
              <el-input v-model.trim="jig_definition.rec_time" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="20" :offset="2">
            <el-form-item label="编辑人">
              <el-input v-model.trim="jig_definition.edit_by_name" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="20" :offset="2">
            <el-form-item label="编辑时间">
              <el-input v-model.trim="jig_definition.edit_time" disabled />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <el-divider />
      <span slot="footer" class="dialog-footer">
        <el-button @click="show_edit_dialog = false">取 消</el-button>
        <el-popconfirm title="确认进行编辑吗？" @onConfirm="edit_jig_definition">
          <el-button slot="reference" type="primary">确定</el-button>
        </el-popconfirm>
      </span>
    </el-dialog>
  </el-card>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'Index',
  data: function() {
    return {
      jig_family_list: [],
      jig_family: null, // 选中的工夹具类别(1.id 2.family)
      jig_definition_list: [], // 工夹具定义list
      page_size: 10,
      page_number: 1,
      all: 0,
      show_add_family: false, // 是否显示添加工夹具类别的dialog
      workcell_list: [],
      sel_form: {
        code: '',
        name: '',
        workcell_id: '',
        user_for: ''
      },
      show_edit_dialog: false, // 是否显示编辑工夹具定义信息的dialog
      jig_definition: null, // 要编辑的工夹具定义信息
      edit_jig_part_no: [],
      model_list: [],
      part_no_list: []
    }
  },
  computed: {
    ...mapGetters([
      'id' // 用户id
    ])
  },
  watch: {
  },
  created() {
    this.$ajax.get('/api/get_workcell_list').then(
      response => {
        this.workcell_list = response.data
      }
    )
    this.$ajax.get('/api/get_model_list').then(
      response => {
        this.model_list = response.data
      }
    )
    this.$ajax.get('/api/get_part_no_list').then(
      response => {
        this.part_no_list = response.data
      }
    )
    this.get_jig_family_list()
  },
  methods: {
    get_jig_family_list: function() {
      this.$ajax.get('/api/supervisor/get_jig_family', {
        params: {}
      }).then(
        response => {
          this.jig_family_list = response.data
        }
      )
    },
    get_jig_family: function(family) {
      this.jig_family = family
      this.$ajax.get('/api/supervisor/get_jig_definition_list', {
        params: {
          family_id: this.jig_family.id,
          code: this.sel_form.code,
          name: this.sel_form.name,
          workcell_id: this.sel_form.workcell_id,
          user_for: this.sel_form.user_for,
          page_size: this.page_size,
          page_number: this.page_number
        }
      }).then(
        response => {
          this.jig_definition_list = response.data.data
          this.all = response.data.all
        }
      )
    },
    get_jig_definition_list: function() {
      var family_id = ''
      if (this.jig_family != null) {
        family_id = this.jig_family.id
      }
      this.$ajax.get('/api/supervisor/get_jig_definition_list', {
        params: {
          family_id: family_id,
          code: this.sel_form.code,
          name: this.sel_form.name,
          workcell_id: this.sel_form.workcell_id,
          user_for: this.sel_form.user_for,
          page_size: this.page_size,
          page_number: this.page_number
        }
      }).then(
        response => {
          this.jig_definition_list = response.data.data
          this.all = response.data.all
        }
      )
    },
    get_jig_definition: function(jig_definition) {
      this.show_edit_dialog = true
      this.jig_definition = jig_definition
      this.edit_jig_part_no = jig_definition.part_no.split('|')
    },
    edit_jig_definition: function() {
      this.jig_definition.part_no = this.edit_jig_part_no.sort().join('|')
      this.$ajax.get('/api/supervisor/edit_jig_info', {
        params: {
          id: this.jig_definition.id,
          code: this.jig_definition.code,
          name: this.jig_definition.name,
          family_id: this.jig_definition.family_id,
          model: this.jig_definition.model,
          part_no: this.jig_definition.part_no,
          pm_period: this.jig_definition.pm_period,
          user_for: this.jig_definition.user_for,
          upl: this.jig_definition.upl,
          jig_workcell_id: this.jig_definition.workcell_id,
          user_id: this.id
        }
      }).then(
        response => {
          if (response.data > 0) {
            this.$message.success('编辑成功!')
            this.show_edit_dialog = false
          } else {
            this.$message.error('服务器错误!')
          }
        }
      )
    },
    clear_form: function() {
      this.sel_form = {
        code: '',
        name: '',
        workcell_id: '',
        user_for: ''
      }
    },
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done()
        })
        .catch(_ => {})
    },
    handleSizeChange: function(val) {
      this.page_size = val
      this.get_jig_definition_list()
    },
    handleCurrentChange: function(val) {
      this.page_number = val
      this.get_jig_definition_list()
    }
  }
}
</script>

<style scoped>
  .box-card{
    width: 96%;
    margin: 2% 2%
  }
  .small-box-card{
    height: 500px;
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
