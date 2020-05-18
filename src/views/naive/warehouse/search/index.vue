<template>
  <el-card class="box-card">
    <el-form ref="form" :model="form" label-width="140px" label-position="right" style="margin-top: 2%">
      <el-row :gutter="20">
        <el-col :span="11" :offset="1">
          <el-form-item label="工夹具名字">
            <el-input v-model="form.code" />
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item label="工夹具名字">
            <el-input v-model="form.name" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="11" :offset="1">
          <el-form-item label="工作部门">
            <el-input v-model="form.workcell" />
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item label="类别">
            <el-input v-model="form.family" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="11" :offset="1">
          <el-form-item label="用途">
            <el-input v-model="form.user_for" />
          </el-form-item>
        </el-col>
        <el-col :span="10" :offset="2">
          <el-button type="primary" icon="el-icon-search" @click="search">查询</el-button>
          <el-button icon="el-icon-delete" @click="clearForm()">清空</el-button>
          <el-button>导出本页</el-button>
          <el-button>导出全部</el-button>
        </el-col>
      </el-row>
    </el-form>
    <el-divider />
    <el-table :data="jig_entity_list" style="width: 94%; margin: 2% 3%" border>
      <el-table-column prop="code" label="工夹具代码" />
      <el-table-column prop="name" label="工夹具名字" />
      <el-table-column prop="workcell" label="所属部门" />
      <el-table-column prop="family" label="类别" />
      <el-table-column prop="pm_period" label="库存数量" />
      <el-table-column prop="user_for" label="用途" />
      <el-table-column
        label="操作"
        width="100"
      >
        <template slot-scope="scope">
          <el-button type="text" @click="show(scope.row)">查看明细</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      title="工夹具明细"
      :visible.sync="showVisible"
      :before-close="handleClose"
    >
      <el-row v-if="jig_entity != null" :gutter="20">
        <el-col :span="22" :offset="1">
          <el-form ref="form" :model="form" label-width="150px" label-position="left">
            <el-row>
              <el-col :span="24">
                <el-form-item label="工夹具代码">
                  <el-input v-model="jig_entity.code" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="工夹具名字">
                  <el-input v-model="jig_entity.name" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="所属部门">
                  <el-input v-model="jig_entity.workcell" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="类别">
                  <el-input v-model="jig_entity.family" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="工夹具模组">
                  <el-input v-model="jig_entity.model" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="料号">
                  <el-input v-model="jig_entity.part_no" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="用途">
                  <el-input v-model="jig_entity.user_for" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="每条产线所需">
                  <el-input v-model="jig_entity.upl" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="责任人">
                  <el-input v-model="jig_entity.owner_name" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="录入人">
                  <el-input v-model="jig_entity.rec_by_name" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="录入时间">
                  <el-input v-model="jig_entity.rec_time" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="修改人">
                  <el-input v-model="jig_entity.edit_by_name" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="修改时间">
                  <el-input v-model="jig_entity.edit_time" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="保养周期">
                  <el-input v-model="jig_entity.pm_period" disabled />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-col>
      </el-row>
    </el-dialog>
    <el-pagination
      v-if="jig_entity_list.length !== 0"
      style="text-align: center"
      :current-page="page_number"
      :page-sizes="[5, 10, 20, 30]"
      :page-size="page_size"
      layout="total, sizes, prev, pager, next, jumper"
      :total="all"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </el-card>
</template>
<script>
export default {
  name: 'Index',
  data: function() {
    return {
      workcell_list: [],
      form: {
        code: '',
        name: '',
        workcell: '',
        date: ['', ''],
        user_for: '',
        family: ''
      },
      jig_entity_list: [],
      jig_entity: null,
      page_size: 10,
      page_number: 1,
      all: 0,
      showVisible: false
    }
  },
  created() {
    this.$ajax.get('/get_workcell_list').then(
      response => {
        this.workcell_list = response.data
      }
    )
  },
  methods: {
    getData: function() {
      this.$ajax.get('/naive/search_jig_definition', {
        params: {
          code: this.form.code,
          name: this.form.name,
          workcell: this.form.workcell,
          family: this.form.family,
          user_for: this.form.user_for,
          page_number: this.page_number,
          page_size: this.page_size
        }
      }).then(
        response => {
          this.jig_entity_list = response.data.data
          this.all = response.data['all']
          if (response.data.all === 0) {
            this.$message.info('查询暂无结果')
          } else {
            this.$message.success('查询到' + response.data.all + '条记录')
          }
        }
      )
    },
    search: function() {
      this.page_number = 1
      this.getData()
    },
    clearForm: function() {
      this.form = {
        code: '',
        name: '',
        workcell: '',
        date: ['', ''],
        user_for: '',
        family: ''
      }
      this.jig_entity_list = []
      this.showPerson = null
    },
    show: function(row) {
      this.jig_entity = row
      this.showVisible = true
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
      this.getData()
    },
    handleCurrentChange: function(val) {
      this.page_number = val
      this.getData()
    }
  }
}
</script>

<style scoped>
  .box-card{
    width: 96%;
    margin: 2% 2%
  }
</style>
