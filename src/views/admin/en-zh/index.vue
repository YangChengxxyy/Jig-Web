<template>
  <el-card class="box-card">
    <el-row>
      <el-col :span="22" :offset="1">
        <el-table :data="cn_en_list">
          <el-table-column label="英文" prop="english" :filters="filters" :filter-method="filterHandler" sortable />
          <el-table-column label="中文" prop="chinese" />
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="text" @click="edit(scope.row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
    <el-dialog title="编辑" :visible.sync="dialogVisible" :before-close="handleClose" width="25%">
      <span>
        <el-form ref="form" :model="cn_en" label-position="left" label-width="80px">
          <el-form-item label="英文">
            <el-input v-model="cn_en.english" readonly />
          </el-form-item>
          <el-form-item label="中文">
            <el-input v-model="cn_en.chinese" />
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmEdit(cn_en)">确 定</el-button>
      </span>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  name: 'Index',
  data() {
    const filters = []
    for (let i = 0; i < 26; i++) {
      const a = String.fromCharCode(97 + i)
      filters.push({ text: a, value: a })
    }
    for (let i = 0; i < 26; i++) {
      const a = String.fromCharCode(65 + i)
      filters.push({ text: a, value: a })
    }
    console.log(filters)
    return {
      cn_en_list: [],
      dialogVisible: false,
      cn_en: {
        id: '',
        english: '',
        chinese: ''
      },
      filters
    }
  },
  created() {
    this.$ajax.get('/admin/get_cn_en').then(
      (response) => {
        const { data } = response
        this.cn_en_list = data
      }
    )
  },
  methods: {
    edit: function(row) {
      this.dialogVisible = true
      this.cn_en = row
    },
    handleClose: function() {
      this.$confirm('确认关闭？')
        .then(_ => {

        })
        .catch(_ => {
        })
    },
    filterHandler(value, row, column) {
      const a = '^' + value + '.*'
      return row.english.match(a)
    },
    confirmEdit: function(cn_en) {
      this.dialogVisible = false
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
