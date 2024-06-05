<template>
	<div class="system-user-dialog-container">
		<el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" width="80%">
			<template #header="{ titleId, titleClass }">
                <div class="my-header">
                    <h4 :id="titleId" :class="titleClass">{{ state.dialog.title }}</h4>
                </div>
            </template>
            <el-table :data="state.tableData.data" v-loading="state.tableData.loading" style="width: 100%">
                <el-table-column type="index" label="序号" width="60" />
                <el-table-column prop="building" label="楼栋" show-overflow-tooltip></el-table-column>
                <el-table-column prop="storey" label="楼层" show-overflow-tooltip></el-table-column>
                <el-table-column prop="count" label="寝室数量" show-overflow-tooltip></el-table-column>
				<el-table-column prop="times" label="选择打印时间" show-overflow-tooltip width="300">
					<template #default="scope">
						<el-date-picker
							v-model="scope.row.times"
							type="date"
							placeholder="选择打印时间"
							size="small"
							value-format="YYYY-MM-DD"
							format="YYYY-MM-DD"
							:disabled-date="disabledDate"
						/>
					</template>
				</el-table-column>
                <el-table-column label="操作" width="170">
					<template #default="scope">
						<el-button :disabled="scope.row.username === 'admin'" size="small" text type="primary" @click="print(scope.row)"
							>打印</el-button
						>
					</template>
				</el-table-column>
            </el-table>
            <el-pagination
                @size-change="onHandleSizeChange"
                @current-change="onHandleCurrentChange"
                class="mt15"
                :pager-count="5"
                :page-sizes="[10, 20, 30]"
                v-model:current-page="state.tableData.param.pageNum"
                background
                v-model:page-size="state.tableData.param.pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="state.tableData.total"
            >
            </el-pagination>
		</el-dialog>
		<div ref="printRef" v-show="false">
			<div class="header-title mb20"><h2>{{ state.pingfenPrint.school }} 润德教育学生公寓常规检查记录表</h2></div>
			<div class="signature mb20"><span>{{ state.pingfenPrint.times }}</span><span>A楼3层</span></div>
			<table>
				<tbody>
					<tr>
						<th rowspan="2">寝室</th>
						<th colspan="2">上午</th>
						<th colspan="2">下午</th>
					</tr>
					<tr>
						<th>卫生</th>
						<th>纪律 迟到</th>
						<th>卫生</th>
						<th>纪律 迟到</th>
					</tr>
					<tr v-for="(v, k) in state.pingfenPrint.print">
						<td>{{ v.name }}</td>
						<td><p v-if="v.morning.public.length === 0">优秀！</p><p v-else v-for="(item, index) in v.morning.public" :key="index">{{ item }}</p></td>
						<td><p v-if="v.morning.personal.length === 0">优秀！</p><p v-else v-for="(item, index) in v.morning.personal" :key="index">{{ item }}</p></td>
						<td><p v-if="v.afternoon.public.length === 0">优秀！</p><p v-else v-for="(item, index) in v.afternoon.public" :key="index">{{ item }}</p></td>
						<td><p v-if="v.afternoon.personal.length === 0">优秀！</p><p v-else v-for="(item, index) in v.afternoon.personal" :key="index">{{ item }}</p></td>
					</tr>
					<!-- 你可以根据需要添加更多的数据行 -->
				</tbody>
			</table>
		</div>
	</div>
	<AddStuDialog ref="addStuDialogRef" @refresh="getTableData()" />
</template>

<script setup lang="ts" name="classDialog">
import { reactive, ref, nextTick, defineAsyncComponent } from 'vue';
import { useDormitoryApi } from '/@/api/dormitory';
import { ElMessage, FormRules, FormInstance, ElMessageBox } from 'element-plus';

const AddStuDialog = defineAsyncComponent(() => import('/@/views/dormitory/addStuDialog.vue'));

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

// 定义变量内容
const addStuDialogRef = ref();
const printRef = ref();
const state = reactive({
	tableData: {
		data: [],
		total: 0,
		loading: false,
		param: {
			search: '',
			pageNum: 1,
			pageSize: 10,
		},
	},
	pingfenPrint: {
		print: [{
			name: '',
			morning: {
				public: [],
				personal: []
			},
			afternoon: {
				public: [],
				personal: []
			}
		}],
		school: 'school',
		times: '',
	},
    dialog: {
		isShowDialog: false,
		title: '',
		data: {} as any,
	},
});

// 初始化表格数据
const getTableData = () => {
	state.tableData.loading = true;
	//const data = [];
	useDormitoryApi().getStorey(state.tableData.param).then((res) => {
		ElMessage.success(res.message);
		state.tableData.total = Number(res.count)
		state.tableData.data = res.data
	    console.log(state)
	})
	setTimeout(() => {
		state.tableData.loading = false;
	}, 500);
};

// 打开弹窗
const openDialog = () => {
	//classDialogFormRef.value.resetFields();
	state.dialog.isShowDialog = true;
    state.dialog.title = `楼层评分打印`;
	nextTick(() => {
		getTableData();
	})
	//getMenuData();
};

// 分页改变
const onHandleSizeChange = (val: number) => {
	state.tableData.param.pageSize = val;
	getTableData();
};
// 分页改变
const onHandleCurrentChange = (val: number) => {
	state.tableData.param.pageNum = val;
	getTableData();
};

const disabledDate = (time: Date) => {
  return time.getTime() > Date.now()
}

// 打印
const print = async (row: any) => {
	console.log(row)
	state.pingfenPrint.times = row.times
	await useDormitoryApi().pingfenPrint(row).then((res) => {
		ElMessage.success(res.message);
		state.pingfenPrint.print = res.data
		state.pingfenPrint.school = res.school
	})
	const printContent = printRef.value.innerHTML; // 获取需要打印的内容
	//const windowUrl = 'data:text/html;charset=utf-8,' + encodeURI(printContent); // 转换为打印页面的URL
	let newWindow = window.open("打印窗口", '_blank'); // 打开一个新窗口
	const html = `
      <html>
        <head>
          <style>
            /* 在这里指定打印时的样式 */
			table {
				width: 100%;
				border-collapse: collapse;
			}
			th, td {
				border: 1px solid black;
				padding: 8px;
				text-align: center;
			}
			th {
				background-color: #f2f2f2;
			}
			.header-title {
				text-align: center;
			}
			.time-signature {
				text-align: center;
			}
			.signature {
				display: flex;
				justify-content: space-between;
 				width: 100%; /* 可以根据需要设置宽度 */
			}
			.mb20 {
				margin-bottom: 20px;
			}
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `;
	newWindow?.document.write(html);
	newWindow?.document.close();
	newWindow?.focus(); // 聚焦新窗口
	newWindow?.print(); // 执行打印
	newWindow?.close(); // 关闭新窗口
};

//格式化时间
const formatDate = (date: any) => {
	const localDate = new Date(date);
	return localDate.toLocaleString(); // 使用浏览器的本地时间格式
}

// 暴露变量
defineExpose({
	openDialog,
});
</script>
<style scoped>
.my-header {
  display: flex;
  flex-direction: row;
  /* justify-content: space-between; */
  gap: 16px;
}

@media print {
	table {
		width: 100%;
		border-collapse: collapse;
	}
	th, td {
		border: 1px solid black;
		padding: 8px;
		text-align: left;
	}
	th {
		background-color: #f2f2f2;
	}
	.header-title {
		text-align: center;
	}
	.time-signature {
		text-align: left;
	}
	.signature {
		text-align: right;
		
	}
}

</style>
