<template>
  <el-card class="box-card">
    <el-row :gutter="20">
      <el-col :span="20" :offset="1">
        <el-button type="primary" style="margin-top: 1%" @click="show_in_jig_drawer = true">
          采购入库
        </el-button>
      </el-col>
    </el-row>
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
          <el-form-item label="用途">
            <el-input v-model="sel_form.user_for" />
          </el-form-item>
        </el-col>
        <el-col :span="10" :offset="2">
          <el-button type="primary" icon="el-icon-search" @click="search()">查询</el-button>
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
          class="el-menu-vertical-demo"
          :collapse="menu_is_collapse"
          :active-text-color="menu_active_color"
        >
          <el-submenu v-for="(item,index) in location_list" :key="item.jig_cabinet_id" :index="index+1+''">
            <template slot="title">
              <i class="el-icon-location" />
              <span>{{ item.jig_cabinet_id }}夹具柜</span>
            </template>
            <el-menu-item-group>
              <template slot="title">存放区域</template>
              <el-menu-item
                v-for="(location,l_index) in item.location_id"
                :key="item.jig_cabinet_id+location"
                :class="{'is-active':item.jig_cabinet_id === jig_cabinet_id && location === jig_location_id}"
                :index="index+1+''+'-'+l_index+1+''"
                @click="get_jig_list_by_location(item.jig_cabinet_id,location)"
              >
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
              <el-button type="warning" @click="get_maintenance_jig_list(scope.row.code)">检点</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-if="jig_list.length !== 0"
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
    <el-drawer
      ref="input_jig_drawer"
      title="工夹具入库"
      :visible.sync="show_in_jig_drawer"
      direction="rtl"
      :size="'550px'"
      @before-close="clean_in_jig_form()"
    >
      <el-form ref="in_jig_form" label-width="100px" label-position="left" :model="in_jig_form">
        <el-row>
          <el-col :span="20" :offset="2">
            <el-form-item label="单据号" :rules="[{required: true,message:'请填写单据号',trigger: 'change'}]" prop="bill_no">
              <el-input v-model="in_jig_form.bill_no" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="5" :offset="4">
            <el-button type="danger" icon="el-icon-delete" @click="clean_in_jig_form">清 空</el-button>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20" :offset="2">
            <el-divider />
          </el-col>
        </el-row>
        <el-row v-for="(item,index) in in_jig_form.code" :key="index" :gutter="10">
          <el-col :span="9" :offset="2">
            <el-form-item
              :label="'工夹具代码'+(index+1)"
              label-width="100px"
              :rules="[{required:true,message:'此项不得为空',trigger:'change'}]"
              :prop="'code['+index+']'"
            >
              <el-select v-model="in_jig_form.code[index]">
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
                {type: 'number',min: 1,max:in_jig_form.real_free_bin_count_list[index],message: '请符合剩余bin位数',trigger: 'change'}]"
              :prop="'count['+index+']'"
            >
              <el-input-number
                v-model.number="in_jig_form.count[index]"
                controls-position="right"
                size="medium"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-button icon="el-icon-minus" circle @click="reduce(index)" />
            <el-button v-if="index === in_jig_form.code.length-1" icon="el-icon-plus" circle @click="add" />
          </el-col>
          <el-col :span="12" :offset="2">
            <el-form-item
              label="存放位置"
              :rules="[{required:true,message:'此项不得为空',trigger:'change'}]"
              :prop="'jig_position['+index+']'"
            >
              <el-cascader
                v-model="in_jig_form.jig_position[index]"
                :options="warehouse_label"
                separator="-"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <div v-if="in_jig_form.free_bin_count_list[index] !== 'x'" class="font-warning label-font-style">剩余bin位数量:
              {{ in_jig_form.free_bin_count_list[index] }}
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20" :offset="2">
            <el-divider />
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20" :offset="2">
            <el-form-item>
              <el-button style="width: 48%" @click="show_in_jig_drawer = false">取 消</el-button>
              <template>
                <el-popconfirm
                  title="确定要添加采购入库的工夹具吗？"
                  @onConfirm="input_jig('in_jig_form')"
                >
                  <el-button slot="reference" type="primary" style="width: 48%">确 定</el-button>
                </el-popconfirm>
              </template>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-drawer>
    <el-dialog title="工夹具信息" :visible.sync="show_jig_info" width="30%">
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
                <el-input v-model="jig_entity.bill_no" readonly />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="20" :offset="2">
              <el-form-item label="入库时间">
                <el-input v-model="jig_entity.reg_date" readonly />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="20" :offset="2">
              <el-form-item label="存放位置">
                <el-input
                  v-if="jig_entity.bin === null"
                  :value="jig_entity.jig_cabinet_id+'-'+jig_entity.location_id"
                  readonly
                />
                <el-input
                  v-else-if="jig_entity.bin != null"
                  :value="jig_entity.jig_cabinet_id+'-'+jig_entity.location_id+'-'+jig_entity.bin"
                  readonly
                />
              </el-form-item>
            </el-col>
            <el-col :span="2">
              <el-tooltip class="item" effect="dark" content="修改存放位置" placement="right">
                <el-button type="info" icon="el-icon-setting" circle @click="show_change_jig_position_dialog = true" />
              </el-tooltip>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="20" :offset="2">
              <el-form-item label="使用次数">
                <el-input v-model="jig_entity.user_for" readonly />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <el-divider />
        <el-collapse style="height: 350px">
          <el-scrollbar style="height:100%">
            <el-collapse-item title="追溯出入库历史" name="1">
              <el-timeline v-if="jig_entity.out_and_in_history_list.length > 0">
                <el-timeline-item
                  v-for="(item, index) in jig_entity.out_and_in_history_list"
                  :key="index"
                  :icon="item.icon"
                  :type="item.type"
                  :timestamp="item.outgo_time"
                >
                  <template v-if="item.status === '0'">
                    申请人:{{ item.submit_name }} <br>
                    产线: {{ item.production_line_name }} <br>
                    出库人: {{ item.rec_name }}
                  </template>
                  <template v-if="item.status === '1'">
                    归还人: {{ item.submit_name }} <br>
                    产线: {{ item.production_line_name }} <br>
                    入库人: {{ item.rec_name }}
                  </template>
                  <template v-if="item.status === '2'">
                    调换位置: {{ item.description }}<br>
                    操作人: {{ item.rec_name }}
                  </template>
                  <template v-if="item.status === '3'">
                    采购入库: <br>
                    <template v-for="(des, index) in item.description.split('~')">
                      <template v-if="index == 0">单据号: {{ des }} <br :key="'bill_no_'+des"></template>
                      <template v-if="index == 1">
                        工夹具代码及件数: <br :key="'code_count_des_'+des">
                        <template v-for="(code, i) in des.split('|')">&nbsp;&nbsp;&nbsp;&nbsp;{{ code }} - {{ item.description.split('~')[2].split('|')[i] }} 件 <br :key="'code_count_'+code"></template>
                      </template>
                    </template>
                    入库人: {{ item.rec_name }}
                  </template>
                </el-timeline-item>
              </el-timeline>
              <div v-else="" class="font-info">暂无该工夹具出入库历史记录</div>
            </el-collapse-item>
          </el-scrollbar>
        </el-collapse>
      </template>
    </el-dialog>
    <el-dialog title="修改存放位置" :visible.sync="show_change_jig_position_dialog" width="25%">
      <template>
        <el-form
          ref="change_jig_position_form"
          :model="change_jig_position_form"
          label-width="100px"
          label-position="left"
        >
          <el-form-item label="存放位置" :rules="[{required:true,message:'此项不得为空',trigger:'change'}]" prop="jig_position">
            <el-cascader
              v-model="change_jig_position_form.jig_position"
              :options="change_position_warehouse_label"
              separator="-"
            />
          </el-form-item>
        </el-form>
      </template>
      <span slot="footer" class="dialog-footer">
        <el-popconfirm
          title="确定修改存放位置吗？"
          @onConfirm="change_jig_position('change_jig_position_form')"
        >
          <el-button slot="reference" type="primary">确 定</el-button>
        </el-popconfirm>
      </span>
    </el-dialog>
    <el-dialog title="出库" :visible.sync="show_outgo_jig" width="30%">
      <template v-if="jig_entity_list.length > 0">
        <el-form
          ref="outgo_form"
          :model="outgo_form"
          :rules="outgo_form_rules"
          label-width="150px"
          label-position="left"
        >
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
              <el-form-item label="刷卡或输入工号" prop="user_id">
                <el-input v-model.trim="outgo_form.user_id" @change="get_user_name" />
                <div v-if="user_name != ''" class="form-font-alert-success">{{ user_name }}</div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="20" :offset="2">
              <el-form-item label="选择产线" prop="production_line_id">
                <el-select v-model="outgo_form.production_line_id" placeholder="选择产线">
                  <el-option
                    v-for="item in production_line_list"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </template>
      <el-divider />
      <span slot="footer" class="dialog-footer">
        <el-button @click="show_outgo_jig = false">取 消</el-button>
        <el-popconfirm title="确认出库吗？" @onConfirm="outgo_jig('outgo_form')">
          <el-button slot="reference" type="primary">出库</el-button>
        </el-popconfirm>
      </span>
    </el-dialog>
    <el-dialog title="检点" :visible.sync="show_maintenance_jig_dialog" width="30%">
      <template v-if="maintenance_jig_list.length > 0">
        <el-form ref="maintenance_form" :model="maintenance_form" label-width="150px" label-position="left">
          <el-row :gutter="10">
            <el-col :span="20" :offset="2">
              <el-form-item label="选择工夹具">
                <el-select v-model="maintenance_seq_id" placeholder="选择工夹具">
                  <el-option
                    v-for="item in maintenance_jig_list"
                    :key="item.seq_id"
                    :label="item.code+'-'+item.seq_id"
                    :value="item.seq_id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="20" :offset="2">
              <el-form-item label="上次检点时间">
                <span v-if="maintenance_jig_detail.last_time != null">{{ maintenance_jig_detail.last_time }}</span>
                <span v-else class="font-info">还未检点过</span>
              </el-form-item>
            </el-col>
            <el-col :span="20" :offset="2">
              <h4>以下选项是否无误:</h4>
              <el-checkbox v-model="check_all" :indeterminate="isIndeterminate" @change="handleCheckAllChange">全选
              </el-checkbox>
              <template>
                <el-checkbox-group v-model="maintenance_form.maintenance_check_list">
                  <el-checkbox
                    v-for="type in maintenance_type_list"
                    :key="type.id"
                    :label="type.id"
                    style="display: block;margin-bottom: 2px"
                  >{{ type.description }}
                  </el-checkbox>
                </el-checkbox-group>
              </template>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="4" :offset="2">
              <el-button type="danger" plain @click="get_jig_trouble_percent">故障概率</el-button>
            </el-col>
            <el-col :span="16">
              <el-form-item>
                <div class="font-info">{{ maintenance_form.trouble_percent }}</div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </template>
      <el-divider />
      <el-collapse style="height: 300px">
        <el-scrollbar style="height:100%">
          <el-collapse-item title="追溯检点历史" name="1">
            <el-timeline
              v-if="maintenance_jig_detail != null && maintenance_jig_detail.maintenance_history_list.length > 0"
            >
              <el-timeline-item
                v-for="(item, index) in maintenance_jig_detail.maintenance_history_list"
                :key="index"
                :icon="item.icon"
                :type="item.type"
                :timestamp="item.check_time"
              >
                <template v-if="item.is_repair === 0">
                  检点人:{{ item.check_name }} <br>
                  检修问题:
                  <template v-if="item.reason_description.length > 0">
                    <template v-for="(reason, i1) in item.reason_description">
                      <div :key="reason" class="font-warning">{{ i1+1 }}.{{ reason }}</div>
                    </template>
                  </template>
                  <template v-else>
                    正常<br>
                  </template>
                  报修情况: 无需报修
                </template>
                <template v-if="item.is_repair === 1">
                  检点人:{{ item.check_name }} <br>
                  检修问题:
                  <template v-if="item.reason_description.length > 0">
                    <template v-for="(reason, i2) in item.reason_description">
                      <div :key="reason" class="font-warning">{{ i2+1 }}.{{ reason }}</div>
                    </template>
                  </template>
                  <template v-else>
                    <div class="font-success">正常<br></div>
                  </template>
                  报修情况: 已报修
                </template>
              </el-timeline-item>
            </el-timeline>
            <div v-else class="font-info">暂无该工夹具检点历史记录</div>
          </el-collapse-item>
        </el-scrollbar>
      </el-collapse>
      <el-divider />
      <span slot="footer" class="dialog-footer">
        <el-button @click="show_maintenance_jig_dialog = false">取 消</el-button>
        <el-popconfirm title="确认已经检查无误了吗？" @onConfirm="maintenance_jig(0)">
          <el-button slot="reference" type="primary">检点</el-button>
        </el-popconfirm>
        <el-popconfirm title="确认已经检查无误并且需要报修吗？" @onConfirm="maintenance_jig(1)">
          <el-button slot="reference" type="warning">检点并报修</el-button>
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
    const that = this
    var is_check_user_id = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入工号'))
      } else if (that.user_name === '') {
        setTimeout(() => {
          callback(new Error('请输入正确的工号'))
        }, 100)
      } else {
        callback()
      }
    }
    return {
      menu_is_collapse: false, // 存放库位菜单是否折叠
      menu_active_color: '#409EFF',
      is_select: false, // 在页数跳转时判断是调用那个方法获取
      warehouse: [],
      all_warehouse_label: [],
      warehouse_label: [],
      show_in_jig_drawer: false, // 是否显示工夹具采购入库的drawer
      all_code_list: [], // 所有工夹具代码list
      code_list: [], // 当前工夹具代码list(除去当前已经选择的)
      in_jig_form: {
        bill_no: '',
        code: [''],
        count: [1],
        jig_position: [''],
        free_bin_count_list: ['x'], // 前端显示的
        real_free_bin_count_list: ['x'],
        free_bin_list: [[]]
      },
      page_size: 10, // 分页所需
      page_number: 1,
      all: 0,
      location_list: [],
      jig_list: [],
      jig_entity_list: [], // 同一种code的工夹具实体list
      jig_entity: null, // 工夹具实体
      code: '', // 选择的工夹具code
      seq_id: '', // 选择的工夹具序列号
      show_jig_info: false, // 是否显示查看工夹具的dialog
      show_outgo_jig: false, // 是否显示工夹具出库的dialog
      show_change_jig_position_dialog: false, // 是否显示查看工夹具里的=》修改存放位置的dialog
      change_position_warehouse_label: [],
      change_jig_position_form: {
        jig_position: ['', '', '']
      },
      production_line_list: [],
      outgo_form: {
        user_id: '', // 出库工夹具时输入user_id
        production_line_id: ''
      },
      outgo_form_rules: {
        user_id: [
          { required: true, validator: is_check_user_id, trigger: 'blur' }
        ],
        production_line_id: [
          { required: true, message: '请选择产线', trigger: 'change' }
        ]
      },
      user_name: '', // 出库工夹具时输入user_id显示的user_name
      workcell_list: [],
      sel_form: { // 搜索条件
        code: '',
        name: '',
        user_for: '',
        workcell_id: ''
      },
      jig_cabinet_id: '',
      jig_location_id: '',
      show_maintenance_jig_dialog: false, // 是否显示检点工夹具的dialog
      maintenance_type_list: [],
      maintenance_jig_list: [], // 要检点的同一种工夹具实体list
      maintenance_seq_id: '', // 选择的seq_id
      maintenance_jig_detail: null, // 要检点的工夹具实体
      maintenance_form: {
        trouble_percent: '',
        maintenance_check_list: [] // 选择 无误的检点类型数组,绑定的model
      },
      maintenance_reason_list: [], // 检点时的有问题的原因list
      maintenance_id_list: [], // 检点类型id数组
      isIndeterminate: true, // 是否全选
      check_all: false // 是否全选
    }
  },
  computed: {
    ...mapGetters([
      'id', // 用户id
      'workcell_id'
    ]),
    in_jig_form_count: function() {
      return this.in_jig_form.count
    },
    in_jig_form_jig_position: function() {
      return this.in_jig_form.jig_position
    },
    get_maintenance_check_list: function() {
      return this.maintenance_form.maintenance_check_list
    }
    /* g_free_bin_count_map: function() {
        var map = new Map()
        this.warehouse.forEach(
          (jig_cabinet, i) => {
            jig_cabinet.location_id_list.forEach(
              (location, i2) => {
                map.set(jig_cabinet.jig_cabinet_id + '-' + location.location_id, location.free_bin_count)
              }
            )
          }
        )
        return map
      },
       free_bin_count_map: function() {
        var map = new Map()
        this.warehouse.forEach(
          (jig_cabinet, i) => {
            jig_cabinet.location_id_list.forEach(
              (location, i2) => {
                map.set(jig_cabinet.jig_cabinet_id + '-' + location.location_id, location.free_bin_count)
              }
            )
          }
        )
        return map
      } */
  },
  watch: {
    /* in_jig_form: {
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
      },*/
    in_jig_form_count: {
      handler(newValue, oldValue) {
        newValue.forEach(
          (v, i) => {
            for (var j = 0; j < this.in_jig_form.free_bin_count_list.length; j++) {
              if (this.in_jig_form.free_bin_count_list[j] !== 'x' && this.in_jig_form.real_free_bin_count_list[j] !== 'x') {
                // var key = this.in_jig_form.jig_position[i][0] + '-' + this.in_jig_form.jig_position[i][1]
                this.in_jig_form.free_bin_count_list[j] = this.in_jig_form.real_free_bin_count_list[j] - newValue[j]
              }
            }
          })
      }
    },
    in_jig_form_jig_position: {
      handler(newValue) {
        this.warehouse_label = this.deepCopy(this.all_warehouse_label) // 深拷贝
        newValue.forEach(
          (v, i) => {
            for (var j = 0; j < this.warehouse_label.length; j++) {
              for (var k = 0; k < this.warehouse_label[j].children.length; k++) {
                if (v[0] === this.warehouse_label[j].value && v[1] === this.warehouse_label[j].children[k].value) {
                  /* this.warehouse_label[j].children = this.warehouse_label[j].children.filter(
                      item => {
                        return item !== this.warehouse_label[j].children[k]
                      }
                    ) */
                  this.warehouse_label[j].children[k].disabled = true
                }
              }
            }
            this.warehouse.forEach(
              (jig_cabinet, i1) => {
                if (jig_cabinet.jig_cabinet_id === v[0]) {
                  jig_cabinet.location_id_list.forEach(
                    (location, i2) => {
                      if (location.location_id === v[1]) {
                        this.in_jig_form.free_bin_list[i] = location.free_bin_list
                        this.in_jig_form.free_bin_count_list[i] = location.free_bin_count - this.in_jig_form.count[i]
                        this.in_jig_form.real_free_bin_count_list[i] = location.free_bin_count
                      }
                    }
                  )
                }
              }
            )
          }
        )
      }
    },
    seq_id(val) {
      for (var i = 0; i < this.jig_entity_list.length; i++) {
        if (this.seq_id === this.jig_entity_list[i].seq_id) {
          this.jig_entity = this.jig_entity_list[i]
        }
      }
    },
    maintenance_seq_id(val) {
      for (var i = 0; i < this.maintenance_jig_list.length; i++) {
        if (this.maintenance_seq_id === this.maintenance_jig_list[i].seq_id) {
          this.maintenance_jig_detail = this.maintenance_jig_list[i]
        }
      }
    },
    jig_entity() { // 设置出入库历史记录 时间线显示的图标
      for (var i = 0; i < this.jig_entity.out_and_in_history_list.length; i++) {
        var list = this.jig_entity.out_and_in_history_list
        if (list[i].status === '0') { // 出库
          list[i].icon = 'el-icon-s-unfold'
          list[i].type = 'primary'
        } else if (list[i].status === '1') { // 入库
          list[i].icon = 'el-icon-s-fold'
          list[i].type = 'primary'
        } else if (list[i].status === '2') { // 调换位置
          list[i].icon = 'el-icon-rank'
          list[i].type = 'warning'
        } else if (list[i].status === '3') { // 采购入库
          list[i].icon = 'el-icon-s-order'
          list[i].type = 'success'
        }
      }
    },
    maintenance_jig_detail() {
      for (var i = 0; i < this.maintenance_jig_detail.maintenance_history_list.length; i++) {
        var m_list = this.maintenance_jig_detail.maintenance_history_list
        if (m_list[i].is_repair === 0) { // 无需报修
          m_list[i].icon = 'el-icon-check'
          m_list[i].type = 'success'
        } else if (m_list[i].is_repair === 1) { // 需要报修
          m_list[i].icon = 'el-icon-warning-outline'
          m_list[i].type = 'warning'
        }
      }
    },
    get_maintenance_check_list() {
      this.maintenance_reason_list = []
      for (var i = 0; i < this.maintenance_id_list.length; i++) {
        this.maintenance_reason_list[i] = this.maintenance_id_list[i]
      }
      for (var j = 0; j < this.maintenance_form.maintenance_check_list.length; j++) {
        for (var k = 0; k < this.maintenance_reason_list.length; k++) {
          if (this.maintenance_form.maintenance_check_list[j] === this.maintenance_reason_list[k]) {
            this.maintenance_reason_list.splice(k, 1)
            break
          }
        }
      }
    },
    show_maintenance_jig_dialog() { // 监管是否显示检点工夹具的页面,关闭或者打开时清空
      this.clear_maintenance_form()
    }
  },
  created() {
    this.get_production_line_list()
    this.get_location_list()
    this.get_code_list()
    this.get_maintenance_type_list()
    this.get_warehouse()
    // this.get_free_bin_count_map()
  },
  methods: {
    get_production_line_list: function() {
      this.$ajax.get('/api/get_production_line_list', {}).then(
        response => {
          this.production_line_list = response.data
        }
      )
    },
    get_warehouse_label: function() {
      this.warehouse_label = []
      this.all_warehouse_label = []
      this.change_position_warehouse_label = []
      for (var i = 0; i < this.warehouse.length; i++) {
        this.warehouse_label.push({
          value: this.warehouse[i].jig_cabinet_id,
          label: this.warehouse[i].jig_cabinet_id,
          children: []
        }) // 将warehouse数据结构转换成适用于级联选择器的数据结构
        this.all_warehouse_label.push({
          value: this.warehouse[i].jig_cabinet_id,
          label: this.warehouse[i].jig_cabinet_id,
          children: []
        })
        this.change_position_warehouse_label.push({
          value: this.warehouse[i].jig_cabinet_id,
          label: this.warehouse[i].jig_cabinet_id,
          children: []
        }) // 将warehouse数据结构转换成适用于级联选择器的数据结构 =》 改变存储位置，需要选择Bin位
        for (var j = 0; j < this.warehouse[i].location_id_list.length; j++) {
          this.warehouse_label[i].children.push({
            value: this.warehouse[i].location_id_list[j].location_id,
            label: this.warehouse[i].location_id_list[j].location_id
          })
          this.all_warehouse_label[i].children.push({
            value: this.warehouse[i].location_id_list[j].location_id,
            label: this.warehouse[i].location_id_list[j].location_id
          })
          this.change_position_warehouse_label[i].children.push({
            value: this.warehouse[i].location_id_list[j].location_id,
            label: this.warehouse[i].location_id_list[j].location_id,
            children: []
          })
          for (var k = 0; k < this.warehouse[i].location_id_list[j].free_bin_list.length; k++) {
            this.change_position_warehouse_label[i].children[j].children.push({
              value: this.warehouse[i].location_id_list[j].free_bin_list[k],
              label: this.warehouse[i].location_id_list[j].free_bin_list[k]
            })
          }
        }
      }
    },
    get_warehouse: function() {
      this.$ajax.get('/api/get_jig_cabinet_list', {}).then(
        res => {
          this.warehouse = res.data
          this.get_warehouse_label()
        }
      )
    },
    in_jig_form_count_change: function(index) {
      var key = this.in_jig_form.jig_position[index][0] + '-' + this.in_jig_form.jig_position[index][1]
      console.log(key)
    },
    get_free_bin_count_map: function() {
      this.free_bin_count_map = new Map()
      for (var i = 0; i < this.warehouse.length; i++) {
        for (var j = 0; j < this.warehouse[i].location_id_list.length; j++) {
          this.free_bin_count_map.set(this.warehouse[i].jig_cabinet_id + '-' + this.warehouse[i].location_id_list[j].location_id, location.free_bin_count)
        }
      }
      this.warehouse.forEach(
        (jig_cabinet, i) => {
          jig_cabinet.location_id_list.forEach(
            (location, i2) => {
              console.log(jig_cabinet.jig_cabinet_id + '-' + location.location_id)
              this.free_bin_count_map.set(jig_cabinet.jig_cabinet_id + '-' + location.location_id, location.free_bin_count)
            }
          )
        }
      )
    },
    input_jig: function(form_name) {
      this.$refs[form_name].validate((valid) => {
        if (valid) {
          var a = this.in_jig_form.free_bin_list.join('|')
          console.log(a)
          this.$ajax.get('/api/naive/input_jig', {
            contentType: 'application/json;charset=utf-8',
            params: {
              bill_no: this.in_jig_form.bill_no,
              code: this.in_jig_form.code.join('|'),
              count: this.in_jig_form.count.join('|'),
              jig_position: this.in_jig_form.jig_position.join('|'), // 格式 7,A2|8,C1
              free_bin_list: this.in_jig_form.free_bin_list.join('|'),
              user_id: this.id
            }
          }).then(
            response => {
              if (response.data > 0) {
                this.$message.success('入库成功!')
                this.get_jig_list_by_location('', '')
                this.show_in_jig_drawer = false
                this.clean_in_jig_form()
              } else {
                this.$message.error('服务器错误!')
              }
            }
          )
        } else {
          return false
        }
      })
      this.$ajax.get()
    },
    get_location_list: function() {
      this.$ajax.get('/api/naive/get_location_list', {
        params: {}
      }).then(
        response => {
          this.location_list = response.data
        }
      )
    },
    get_jig_list_by_location: function(jig_cabinet, location_id) {
      this.is_select = false
      if (this.jig_cabinet_id === jig_cabinet && this.jig_location_id === location_id) {
        this.jig_cabinet_id = ''
        this.jig_location_id = ''
        this.jig_list = []
        this.menu_active_color = '#303133'
        return false
      } else {
        if (jig_cabinet !== '' && location_id !== '') {
          this.jig_cabinet_id = jig_cabinet
          this.jig_location_id = location_id
          this.menu_active_color = '#409EFF'
        }
      }
      this.$ajax.get('/api/naive/get_jig_list_by_location', {
        params: {
          jig_cabinet_id: this.jig_cabinet_id,
          jig_location_id: this.jig_location_id,
          page_number: this.page_number,
          page_size: this.page_size,
          workcell_id: this.workcell_id
        }
      }).then(
        responese => {
          this.jig_list = responese.data.data
          this.all = responese.data.all
        }
      )
    },
    get_jig_list_by_select: function() {
      this.is_select = true
      this.$ajax.get('/api/naive/get_jig_list_by_select', {
        params: {
          jig_cabinet_id: this.jig_cabinet_id,
          jig_location_id: this.jig_location_id,
          code: this.sel_form.code,
          name: this.sel_form.name,
          user_for: this.sel_form.user_for,
          page_number: this.page_number,
          page_size: this.page_size,
          workcell_id: this.workcell_id
        }
      }).then(
        response => {
          this.jig_list = response.data.data
          this.all = response.data.all
          if (response.data.all <= 0) {
            this.$message.error('没有结果！')
          }
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
          user_id: this.outgo_form.user_id
        }
      }).then(
        response => {
          if (response.data === null || response.data === '' || response.data.length === 0) {
            this.user_name = ''
          } else {
            this.user_name = response.data
          }
        }
      )
    },
    change_jig_position: function(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          var position = ''
          position += this.jig_entity.jig_cabinet_id + '-' + this.jig_entity.location_id
          if (this.jig_entity.bin != null && this.jig_entity.bin !== '') {
            position += '-' + this.jig_entity.bin
          }
          this.$ajax.get('/api/naive/change_jig_position', {
            params: {
              code: this.jig_entity.code,
              seq_id: this.jig_entity.seq_id,
              old_position: position,
              jig_cabinet_id: this.change_jig_position_form.jig_position[0],
              location_id: this.change_jig_position_form.jig_position[1],
              bin: this.change_jig_position_form.jig_position[2],
              user_id: this.id
            }
          }).then(
            response => {
              if (response.data > 0) {
                this.$message.success('修改成功!')
                this.get_warehouse()
                this.jig_entity.jig_cabinet_id = this.change_jig_position_form.jig_position[0]
                this.jig_entity.location_id = this.change_jig_position_form.jig_position[1]
                this.jig_entity.bin = this.change_jig_position_form.jig_position[2]
                this.show_change_jig_position_dialog = false
                this.$refs[formName].resetFields()
              } else {
                this.$message.error('服务器错误!')
              }
            }
          )
        } else {
          return false
        }
      })
    },
    deepCopy: function(obj) { // 多层嵌套数组的深拷贝
      var result = Array.isArray(obj) ? [] : {}
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (typeof obj[key] === 'object') {
            result[key] = this.deepCopy(obj[key]) // 递归复制
          } else {
            result[key] = obj[key]
          }
        }
      }
      return result
    },
    outgo_jig: function(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$ajax.get('/api/naive/outgo_jig', {
            params: {
              code: this.code,
              seq_id: this.seq_id,
              submit_id: this.outgo_form.user_id,
              production_line_id: this.outgo_form.production_line_id,
              user_id: this.id
            }
          }).then(
            response => {
              if (response) {
                this.$message.success('出库成功!')
                this.$refs['outgo_form'].resetFields()
                this.user_name = ''
                this.get_jig_list_by_location(this.jig_cabinet_id, this.jig_location_id)
              } else {
                this.$message.error('服务器错误!')
              }
            }
          )
          this.show_outgo_jig = false
        } else {
          if (this.outgo_form.production_line_id === '') {
            this.$message.error('请输入产线号!')
          } else {
            this.$message.error('工号输入错误!')
          }
          return false
        }
      })
    },
    get_maintenance_type_list: function() {
      this.$ajax.get('/api/get_maintenance_type_list', {}).then(
        response => {
          this.maintenance_type_list = response.data
          for (var i = 0; i < this.maintenance_type_list.length; i++) {
            this.maintenance_id_list[i] = this.maintenance_type_list[i].id
          }
        }
      )
    },
    get_maintenance_jig_list: function(code) {
      this.show_maintenance_jig_dialog = true
      this.$ajax.get('/api/naive/get_maintenance_jig_detail_list', {
        params: {
          jig_cabinet_id: this.jig_cabinet_id,
          jig_location_id: this.jig_location_id,
          code: code,
          user_id: this.id
        }
      }).then(
        response => {
          this.maintenance_jig_list = response.data
          if (this.maintenance_jig_list.length > 0) {
            this.maintenance_seq_id = this.maintenance_jig_list[0].seq_id
            this.maintenance_jig_detail = this.maintenance_jig_list[0]
          }
        }
      )
    },
    get_jig_trouble_percent: function() { // 获取工夹具故障概率
      this.$ajax.get('/api/naive/get_jig_trouble_percent', {
        params: {
          reason: this.maintenance_reason_list.join('|'),
          code: this.maintenance_jig_detail.code,
          seq_id: this.maintenance_jig_detail.seq_id
        }
      }).then(
        response => {
          this.maintenance_form.trouble_percent = response.data
        }
      )
    },
    maintenance_jig: function(is_repair) {
      this.show_maintenance_jig_dialog = false
      this.maintenance_form.maintenance_check_list.sort(function(a, b) {
        return a.localeCompare(b)
      })
      var reason = ''
      if (this.maintenance_reason_list.length > 0) {
        reason += this.maintenance_reason_list[0]
      }
      for (var m = 1; m < this.maintenance_reason_list.length; m++) {
        reason += '|' + this.maintenance_reason_list[m]
      }
      this.$ajax.get('/api/naive/maintenance_jig', {
        params: {
          code: this.maintenance_jig_detail.code,
          seq_id: this.maintenance_jig_detail.seq_id,
          reason: reason,
          is_repair: is_repair,
          user_id: this.id
        }
      }).then(
        response => {
          if (response.data < 0) {
            this.$message.error('服务器错误!')
          } else {
            this.$message.success('检点成功!')
            this.clear_maintenance_form()
          }
        }
      )
    },
    clear_maintenance_form: function() {
      this.maintenance_form = {
        maintenance_check_list: [],
        trouble_percent: ''
      }
    },
    get_code_list: function() {
      this.$ajax('/api/get_code_list').then(
        res => {
          this.all_code_list = res.data
          this.code_list = res.data
        }
      )
    },
    reduce(n) { // 在工夹具入库的drawer中减少工夹具的code种类
      if (this.in_jig_form.code.length > 1) {
        this.in_jig_form.code.splice(n, 1)
        this.in_jig_form.count.splice(n, 1)
        this.in_jig_form.jig_position.splice(n, 1)
        this.in_jig_form.free_bin_count_list.splice(n, 1)
        this.in_jig_form.real_free_bin_count_list.splice(n, 1)
        this.in_jig_form.free_bin_list.splice(n, 1)
      }
    },
    add() { // 在工夹具入库的drawer中增加工夹具的code种类
      if (this.in_jig_form.code.length !== 4) {
        this.in_jig_form.code.push('')
        this.in_jig_form.count.push(1)
        this.in_jig_form.jig_position.push('')
        this.in_jig_form.free_bin_count_list.push('x')
        this.in_jig_form.real_free_bin_count_list.push('x')
        this.in_jig_form.free_bin_list.push([])
      } else if (this.in_jig_form.code.length === 4) {
        this.$message.warning('至多选择四项工夹具')
      }
    },
    clean_in_jig_form: function() {
      this.in_jig_form = {
        bill_no: '',
        code: [''],
        count: [1],
        jig_position: [''],
        free_bin_count_list: ['x'],
        real_free_bin_count_list: ['x'],
        free_bin_list: [[]]
      }
    },
    clear_form: function() {
      this.sel_form = {
        code: '',
        name: '',
        workcell_id: '',
        user_for: ''
      }
    },
    search: function() {
      this.page_number = 1
      this.all = 0
      this.get_jig_list_by_select()
    },
    handleSizeChange: function(val) {
      this.page_size = val
      if (this.is_select) {
        this.get_jig_list_by_select()
      } else {
        this.get_jig_list_by_location('', '')
      }
    },
    handleCurrentChange: function(val) {
      this.page_number = val
      if (this.is_select) {
        this.get_jig_list_by_select()
      } else {
        this.get_jig_list_by_location('', '')
      }
    },
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done()
        })
        .catch(_ => {
        })
    },
    handleCheckAllChange(val) {
      this.maintenance_form.maintenance_check_list = val ? this.maintenance_id_list : []
      this.isIndeterminate = false
    },
    handleCheckedCitiesChange(value) {
      const checkedCount = value.length
      this.check_all = checkedCount === this.maintenance_type_list.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.maintenance_type_list.length
    },
    handleChange(value) {
      console.log(value)
    }
  }
}
</script>

<style scoped>
  .box-card {
    width: 96%;
    margin: 2% 2%
  }

  .font-success {
    color: #67C23A;
  }

  .font-error {
    color: #F56C6C;
  }

  .font-warning {
    color: #E6A23C;
  }

  .font-info {
    color: #909399;
  }

  .label-font-style {
    vertical-align: middle;
    line-height: 40px;
    font-size: 14px
  }

  .form-font-alert-success {
    color: #67C23A;
    font-size: 12px;
    line-height: 1;
    padding-top: 4px;
    position: absolute;
    top: 100%;
    left: 0;
  }

  .form-font-alert-error {
    color: #F56C6C;
    font-size: 12px;
    line-height: 1;
    padding-top: 4px;
    position: absolute;
    top: 100%;
    left: 0;
  }

  .border-color-error {
    border-color: #F56C6C;
  }
</style>
