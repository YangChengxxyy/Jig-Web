<template>
  <el-card class="box-card">
    <el-button type="primary" style="margin-left: 3%;margin-top: 2%" @click="drawerVisible = true">
      提交报修
    </el-button>
    <el-table :data="repair_list" border style="width: 94%; margin: 1% 3% 2%">
      <el-table-column label="工夹具代码" prop="code" :filters="code_list_filter" :filter-method="filterHandler" sortable />
      <el-table-column label="工夹具序列号" prop="seq_id" />
      <el-table-column label="故障原因" prop="repair_reason" />
      <el-table-column label="申请时间" prop="submit_time" />
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
      v-if="repair_list.length !== 0"
      style="text-align: center"
      :current-page="page_number"
      :page-sizes="[5, 10, 20, 30]"
      :page-size="page_size"
      layout="total, sizes, prev, pager, next, jumper"
      :total="all"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    <el-dialog title="报修明细" :visible.sync="dialogVisible">
      <el-row>
        <el-col :span="22" :offset="1">
          <el-form v-if="repair != null" label-position="left" label-width="100px">
            <el-form-item label="工夹具代码">
              <el-input v-model="repair.code" readonly />
            </el-form-item>
            <el-form-item label="工夹具序列号">
              <el-input v-model="repair.seq_id" readonly />
            </el-form-item>
            <el-form-item label="报修原因">
              <el-input v-model="repair.repair_reason" readonly />
            </el-form-item>
            <el-form-item label="故障图片">
              <el-image :src="repair.repair_photo_url.split('|')[0]" :preview-src-list="repair.repair_photo_url.split('|')" />
            </el-form-item>
            <el-form-item label="申请人id">
              <el-input v-model="repair.submit_id" readonly />
            </el-form-item>
            <el-form-item label="申请人">
              <el-input v-model="repair.submit_name" readonly />
            </el-form-item>
            <el-form-item label="申请时间">
              <el-input v-model="repair.submit_time" readonly />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </el-dialog>
    <el-drawer ref="drawer" title="申请报修" :visible.sync="drawerVisible" direction="rtl" :size="'504px'">
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
            <el-form-item label="报修原因" prop="repair_reason">
              <el-input v-model="form.repair_reason" type="textarea" :rows="3" />
            </el-form-item>
            <el-form-item label="故障图片" prop="fileList">
              <el-upload
                ref="upload"
                :auto-upload="false"
                :multiple="true"
                list-type="picture-card"
                action="/naive/submit_repair"
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
      repair_list: [],
      page_number: 1,
      page_size: 10,
      all: 0,
      dialogVisible: false,
      repair: null,
      drawerVisible: false,
      code_list: [],
      seq_id_list: [],
      form: {
        code: '',
        seq_id: '',
        repair_reason: '',
        fileList: []
      },
      rules: {
        code: [{ required: true, message: '请选择工夹具代码', trigger: 'change' }],
        seq_id: [{ required: true, message: '请选择工夹具序列号', trigger: 'change' }],
        repair_reason: [{ required: true, message: '请填写报废原因', trigger: 'change' }],
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
  created() {
    this.getData()
    this.$ajax.get('/get_code_list').then(
      response => {
        this.code_list = response.data
        response.data.forEach(
          i => {
            this.code_list_filter.push({ text: i, value: i })
          }
        )
      }
    )
  },
  methods: {
    getData() {
      this.$ajax('/naive/get_repair_list', {
        params: {
          submit_id: this.id,
          page_number: this.page_number,
          page_size: this.page_size
        }
      }).then(
        response => {
          const { data } = response
          this.repair_list = data.data
          this.all = data.all
        }
      )
    },
    showRepair: function(row) {
      this.repair = row
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
                this.getData()
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
      const { code, seq_id, repair_reason } = this.form
      form.append('code', code)
      form.append('seq_id', seq_id)
      form.append('repair_reason', repair_reason)
      form.append('submit_id', this.id)
      this.$ajax({
        method: 'post',
        url: '/naive/submit_repair',
        data: form
      })
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
</style>
