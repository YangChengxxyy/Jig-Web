<template>
  <el-card class="box-card">
    <el-form ref="form" :model="form" label-width="80px" label-position="left" style="margin-top: 2%">
      <el-row :gutter="20">
        <el-col :span="11" :offset="1">
          <el-form-item label="id">
            <el-input v-model="form.id" />
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item label="name">
            <el-input v-model="form.name" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="11" :offset="1">
          <el-form-item label="入职时间">
            <el-date-picker
              v-model="form.date"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              type="datetimerange"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="['12:00:00']"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-button type="primary" icon="el-icon-search" @click="search">查询</el-button>
          <el-button icon="el-icon-delete" @click="clearForm()">清空</el-button>
          <el-link :href="onePage" target="_blank" :disabled="user_list.length === 0"><el-button :disabled="user_list.length === 0">导出本页</el-button></el-link>
          <el-link :href="allPage" target="_blank" :disabled="user_list.length === 0"><el-button :disabled="user_list.length === 0">导出全部</el-button></el-link>
        </el-col>
      </el-row>
    </el-form>
    <el-divider />
    <el-table :data="user_list" style="width: 94%; margin: 2% 3%" border>
      <el-table-column prop="id" label="id" />
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="workcell" label="工作部门" />
      <el-table-column prop="position" label="职位" />
      <el-table-column
        label="操作"
        width="100"
      >
        <template slot-scope="scope">
          <el-button type="text" @click="edit(scope.row)">编辑</el-button>
          <el-popconfirm
            title="确定删除此人吗？"
            icon-color="red"
          ><el-button slot="reference" type="text" @click="del(scope.row)">删除</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      title="修改个人信息"
      :visible.sync="showVisible"
      width="35%"
      :before-close="handleClose"
    >
      <el-row v-if="showPerson != null" :gutter="20">
        <el-col :span="11" :offset="1">
          <el-image :src="showPerson.avatar_url" fit="fill" style="width: 100%;height: 100%">
            <div slot="error" class="image-slot">
              <i class="el-icon-picture-outline" />
            </div>
          </el-image>
        </el-col>
        <el-col :span="11">
          <el-form ref="form" :model="form" label-width="80px" label-position="right">
            <el-row>
              <el-col :span="24">
                <el-form-item label="姓名">
                  <el-input v-model="showPerson.name" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="职位">
                  <el-input v-model="showPerson.position" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="入职时间">
                  <el-date-picker
                    v-model="showPerson.entry_date"
                    type="date"
                    placeholder="选择日期"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="邮箱">
                  <el-input v-model="showPerson.email" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-col>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showVisible = false">取 消</el-button>
        <el-button type="primary" @click="editInfor()">确 定</el-button>
      </span>
    </el-dialog>
    <el-pagination
      v-if="user_list.length !== 0"
      style="width: 30%;margin: 0 35%"
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
import { mapGetters } from 'vuex'
import { getUrl } from '@/utils'
import defaultSettings from '@/settings'
const { devServer } = defaultSettings
export default {
  name: 'Index',
  data: function() {
    return {
      workcell_list: [],
      form: {
        id: '',
        name: '',
        date: ['', '']
      },
      user_list: [],
      showPerson: null,
      showVisible: false,
      page_size: 10,
      page_number: 1,
      all: 0
    }
  },
  computed: {
    ...mapGetters([
      'id', 'token', 'workcell_id'
    ]),
    onePage() {
      const url = devServer + '/api/admin/download_one_user_info'
      const a = {
        submit_id: this.id,
        id: this.form.id,
        name: this.form.name,
        workcell_id: this.workcell_id,
        page_size: this.page_size,
        page_number: this.page_number,
        start_date: this.form.date[0],
        end_date: this.form.date[1],
        file_name: `page-${this.page_number}.xls`,
        token: this.token.token
      }
      return url + '?' + getUrl(a)
    },
    allPage() {
      const url = devServer + '/api/admin/download_all_user_info'
      const a = {
        submit_id: this.id,
        id: this.form.id,
        name: this.form.name,
        workcell_id: this.workcell_id,
        page_size: this.page_size,
        page_number: this.page_number,
        start_date: this.form.date[0],
        end_date: this.form.date[1],
        file_name: 'page-all.xls',
        token: this.token.token
      }
      return url + '?' + getUrl(a)
    }
  },
  created() {
    this.$ajax.get('/api/get_workcell_list').then(
      response => {
        this.workcell_list = response.data
      }
    )
  },
  methods: {
    getData: function() {
      this.$ajax.get('/api/admin/search_user_information', {
        params: {
          submit_id: this.id,
          id: this.form.id,
          name: this.form.name,
          workcell_id: this.workcell_id,
          page_size: this.page_size,
          page_number: this.page_number,
          start_date: this.form.date[0],
          end_date: this.form.date[1]
        }
      }).then(
        response => {
          this.user_list = response.data.data
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
        id: '',
        name: '',
        workcell_id: '',
        date: ['', '']
      }
      this.user_list = []
      this.showPerson = null
    },
    edit: function(row) {
      this.showPerson = row
      this.showVisible = true
    },
    del: function(row) {
      this.$ajax.get('/api/admin/del_user', { params: { id: row.id }}).then(response => {
        this.$message.info('删除成功！')
      })
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
    },
    editInfor() {

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
