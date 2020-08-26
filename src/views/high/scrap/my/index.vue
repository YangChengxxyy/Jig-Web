<template>
  <el-card class="box-card">
    <el-row :gutter="20">
      <el-col :span="22" :offset="1">
        <el-button type="primary" style="margin-top: 1%" @click="drawerVisible = true">
          提交报废
        </el-button>
        <el-table :data="scrap_list" style="margin-top: 1%" border>
          <el-table-column label="工夹具实体" prop="code" :filters="code_list_filter" :filter-method="filterHandler" sortable>
            <template slot-scope="scope">
              <span>{{ scope.row.code }}-{{ scope.row.seq_id }}</span>
            </template>
          </el-table-column>
          <el-table-column label="报废照片" prop="scrap_photo_url">
            <template slot-scope="scope">
              <el-image
                :src="scope.row.scrap_photo_url.split('|')[0]"
                :preview-src-list="scope.row.scrap_photo_url.split('|')"
                style="max-height: 120px"
              />
            </template>
          </el-table-column>
          <el-table-column label="报废原因" prop="scrap_reason" />
          <el-table-column label="申请时间" prop="submit_time" />
          <el-table-column label="状态" width="100%">
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
              <el-button type="text" @click="showRepair(scope.row)">查看</el-button>
              <el-popconfirm
                confirm-button-text="确定"
                cancel-button-text="不用"
                icon="el-icon-info"
                icon-color="red"
                title="确定删除这条记录？"
                @onConfirm="del(scope.row)"
              >
                <el-button slot="reference" type="text">删除</el-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-if="scrap_list.length !== 0"
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
    <el-dialog title="报废明细" :visible.sync="dialogVisible" width="40%">
      <el-row>
        <el-col :span="22" :offset="1">
          <el-form v-if="scrap != null" label-position="left" label-width="100px">
            <el-form-item label="工夹具实体">
              <el-input :value="scrap.code + '-' +scrap.seq_id" readonly />
            </el-form-item>
            <el-form-item label="报废原因">
              <el-input v-model="scrap.scrap_reason" type="textarea" :rows="3" readonly />
            </el-form-item>
            <el-form-item label="故障图片">
              <el-image :src="scrap.scrap_photo_url.split('|')[0]" :preview-src-list="scrap.scrap_photo_url.split('|')" />
            </el-form-item>
            <el-form-item label="申请时间">
              <el-input v-model="scrap.submit_time" readonly />
            </el-form-item>
            <el-form-item label="审批状态">
              <el-input v-if="scrap.status === '0'" value="待初审" readonly />
              <el-input v-else-if="scrap.status === '1'" value="初审未通过" readonly />
              <el-input v-else-if="scrap.status === '2'" value="初审通过" readonly />
              <el-input v-else-if="scrap.status === '3'" value="终审未通过" readonly />
              <el-input v-else value="终审通过" readonly />
            </el-form-item>
            <el-form-item v-if="scrap.first_acceptor_time!=null" label="初审时间">
              <el-input v-model="scrap.first_acceptor_time" />
            </el-form-item>
            <el-form-item v-if="scrap.first_acceptor_name!=null" label="初审人">
              <el-input v-model="scrap.first_acceptor_name" />
            </el-form-item>
            <el-form-item v-if="scrap.first_reason!=null" label="初审不通过原因" style="color: #F56C6C">
              <el-input v-model="scrap.first_reason" />
            </el-form-item>
            <el-form-item v-if="scrap.final_acceptor_time!=null" label="终审时间">
              <el-input v-model="scrap.final_acceptor_time" />
            </el-form-item>
            <el-form-item v-if="scrap.final_acceptor_name!=null" label="终审人">
              <el-input v-model="scrap.final_acceptor_name" />
            </el-form-item>
            <el-form-item v-if="scrap.final_acceptor_time!=null" label="终审不通过原因" style="color: #F56C6C">
              <el-input v-model="scrap.final_acceptor_time" />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </el-dialog>
    <el-drawer ref="drawer" title="申请报废" :visible.sync="drawerVisible" direction="rtl" :size="'504px'">
      <el-row>
        <el-col :span="22" :offset="1">
          <el-form ref="submitForm" label-position="top" label-width="100px" :rules="rules" :model="form">
            <el-form-item label="工夹具代码" prop="code">
              <el-select v-model="form.code" @change="get_seq_id_list()">
                <el-option v-for="item in code_list" :key="item" :value="item" />
              </el-select>
            </el-form-item>
            <el-form-item label="工夹具序列号" prop="seq_id">
              <el-select v-model="form.seq_id">
                <el-option v-for="item in seq_id_list" :key="item" :value="item" />
              </el-select>
            </el-form-item>
            <el-divider />
            <el-form-item label="报废原因" prop="scrap_reason">
              <el-input v-model="form.scrap_reason" type="textarea" :rows="3" />
            </el-form-item>
            <el-form-item label="故障图片" prop="fileList">
              <el-upload
                ref="upload"
                :auto-upload="false"
                :multiple="true"
                list-type="picture-card"
                action="/high/submit_scrap"
                accept="image/*"
                :limit="3"
                :on-change="onChange"
              >
                <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
              </el-upload>
            </el-form-item>
          </el-form>
          <el-divider />
          <el-button style="width: 48%">取 消</el-button>
          <el-button type="primary" style="width: 48%" @click="submitRepair('submitForm','upload')">确 定</el-button>
        </el-col>
      </el-row>
    </el-drawer>
  </el-card>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Index',
  data() {
    return {
      scrap_list: [],
      page_number: 1,
      page_size: 10,
      all: 0,
      dialogVisible: false,
      scrap: null,
      drawerVisible: false,
      code_list: [],
      seq_id_list: [],
      form: {
        code: '',
        seq_id: '',
        scrap_reason: '',
        fileList: []
      },
      rules: {
        code: [{ required: true, message: '请选择工夹具代码', trigger: 'change' }],
        seq_id: [{ required: true, message: '请选择工夹具序列号', trigger: 'change' }],
        scrap_reason: [{ required: true, message: '请填写报废原因', trigger: 'change' }],
        fileList: [{ required: true, message: '请选择故障图片', trigger: 'blur' }]
      },
      code_list_filter: []
    }
  },
  computed: {
    ...mapGetters([
      'id'
    ])
  },
  watch: {
    '$route.query.id': {
      handler() {
        const id = this.$route.query['id']
        if (id !== undefined) {
          this.$ajax.get('/api/get_a_scrap_submit', { params: { id: id }}).then((response) => {
            this.scrap = response.data
            this.dialogVisible = true
          })
        }
      }
    }
  },
  created() {
    this.getData()
    this.$ajax.get('/api/get_code_list').then(
      response => {
        this.code_list = response.data
        response.data.forEach(
          i => {
            this.code_list_filter.push({ text: i, value: i })
          }
        )
      }
    )
    const id = this.$route.query['id']
    if (id !== undefined) {
      this.$ajax.get('/api/get_a_scrap_submit', { params: { id: id }}).then((response) => {
        this.scrap = response.data
        this.dialogVisible = true
      })
    }
  },
  methods: {
    getData() {
      this.$ajax('/api/high/get_scrap', {
        params: {
          submit_id: this.id,
          page_number: this.page_number,
          page_size: this.page_size
        }
      }).then(
        response => {
          const { data } = response
          this.scrap_list = data.data
          this.all = data.all
          if (this.all !== 0) {
            this.$message.success(`查询到共${this.all}条记录`)
          } else {
            this.$message.info('暂无结果')
          }
        }
      )
    },
    showRepair: function(row) {
      this.scrap = row
      this.dialogVisible = true
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
    submitRepair(formName, upload) {
      this.$refs[formName].validate(
        valid => {
          if (valid) {
            this.$confirm('是否提交').then(
              _ => {
                this.submitUpload()
                this.$refs['drawer'].closeDrawer()
                this.$refs[upload].clearFiles()
                this.$refs[formName].resetFields()
              }
            ).catch(
              _ => {
                this.$refs[formName].resetFields()
                this.$refs[upload].clearFiles()
              }
            )
          }
        }
      )
    },
    onChange(file, fileList) {
      this.form.fileList.push(file.name)
    },
    submitUpload() {
      const { uploadFiles } = this.$refs['upload']
      const form = new FormData()
      // 在这里对每一张图片进行大小的校验，如果不符合则提示，所有不符合的都提示，校验完成后只要有不符合条件的就不执行下面的操作
      uploadFiles.forEach(item => {
        form.append('file', item.raw)
      })
      const { code, seq_id, scrap_reason } = this.form
      form.append('code', code)
      form.append('seq_id', seq_id)
      form.append('scrap_reason', scrap_reason)
      form.append('submit_id', this.id)
      form.append('scrap_type', 1)
      this.$ajax({
        method: 'post',
        url: '/api/high/submit_scrap',
        data: form
      }).then(
        response => {
          this.$message.success('提交成功！')
          setTimeout(
            () => {
              this.getData()
            }, 500)
        }
      )
    },
    del: function(row) {
      // TODO:向后台请求删除，后台需要修改
    },
    filterHandler(value, row, column) {
      return row.code === value
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
