<template>
  <el-card class="box-card">
  </el-card>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  name: 'Index',
  data: function() {
    return {
    }
  },
  computed: {
    ...mapGetters([
      'id',
      'token'
    ])
  },
  created() {
  },
  methods: {
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
