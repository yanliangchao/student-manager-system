<template>
	<div class="system-user-dialog-container">
		<el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" width="80%">
            <template #header="{ titleId, titleClass }">
                <div class="my-header">
                    <h4 :id="titleId" :class="titleClass">{{ state.dialog.title }}</h4>
                    <el-button type="primary" size="small" @click="addClassTec()">新增绑定</el-button>
                </div>
            </template>
            <el-table :data="state.tableData.data" v-loading="state.tableData.loading" style="width: 100%">
                <el-table-column type="index" label="序号" width="60" />
                <el-table-column prop="subject" label="科目" show-overflow-tooltip></el-table-column>
                <el-table-column prop="name" label="教师" show-overflow-tooltip></el-table-column>
                <el-table-column prop="level" label="级别" show-overflow-tooltip></el-table-column>
                <el-table-column prop="iphone" label="手机" show-overflow-tooltip></el-table-column>
                <el-table-column label="操作" width="80">
                    <template #default="scope">
                        <el-button :disabled="scope.row.userName === 'admin'" size="small" text type="success" @click="onDeleteStu(scope.row)">移出</el-button>
                    </template>
                </el-table-column>
            </el-table>
		</el-dialog>
        <AddSubDialog ref="addSubDialogRef" @refresh="getTableData()" />
	</div>
</template>

<script setup lang="ts" name="classDialog">
import { reactive, ref, nextTick, defineAsyncComponent } from 'vue';
import { useClassApi } from '/@/api/class';
import { ElMessage, ElMessageBox} from 'element-plus';

const AddSubDialog = defineAsyncComponent(() => import('/@/views/class/addSubDialog.vue'));

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

// 定义变量内容
const addSubDialogRef = ref();

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
	useClassApi().getSubTecById(state.dialog.data.id).then((res) => {
		ElMessage.success(res.message);
		state.tableData.total = Number(res.count)
		state.tableData.data = res.data
		//console.log(state)
	})
	setTimeout(() => {
		state.tableData.loading = false;
	}, 500);
};

// 打开弹窗
const openDialog = (row: ClassType) => {
	//classDialogFormRef.value.resetFields();
	state.dialog.isShowDialog = true;
	state.dialog.data = row
    state.dialog.title = `${row.school_name}-${row.class_name}科目教师详情(${row.tidCount})`;
	nextTick(() => {
		getTableData();
	})
	//getMenuData();
};

// 新增教师科目
const addClassTec = () => {
    addSubDialogRef.value.openDialog(state.dialog.data);
}
// 删除老师科目
const onDeleteStu = (row: any) => {
    ElMessageBox.confirm(`此操作将永久删除班级科目：“${row.subject} / ${row.name}”，是否继续?`, '提示', {
		confirmButtonText: '确认',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(() => {
            row.cid = state.dialog.data.id;
			useClassApi().delSubTec(row).then((res) => {
				ElMessage.success(res.message);
				getTableData();
			})
			
		})
		.catch(() => {});
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
</style>

