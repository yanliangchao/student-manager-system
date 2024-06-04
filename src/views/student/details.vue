<template>
	<div class="system-user-dialog-container">
		<el-dialog :title="state.dialog.showTitle" v-model="state.dialog.isShowDialog" :close-on-click-modal='false' width="500px">
            <!-- <template #header="{ titleId, titleClass }">
                <div class="my-header">
                    <h4 :id="titleId" :class="titleClass">{{ state.dialog.showTitle }}</h4>
                    <el-button type="primary" size="small" @click="addDetails()">新增违纪</el-button>
                </div>
            </template> -->
			<el-timeline style="max-width: 600px">
                <el-timeline-item
                v-for="(activity, index) in state.details"
                :key="index"
                :timestamp="formatDate(activity.times)"
                type='primary'
                placement="top"
                >
                {{ activity.describes }} | -{{ activity.number }}
                </el-timeline-item>
            </el-timeline>
		</el-dialog>
        <!-- <el-dialog v-model="state.dialog.isAddDialog" :close-on-click-modal='false' width="500px">
            <template #header="{ titleId, titleClass }">
                <div class="my-header">
                    <h4 :id="titleId" :class="titleClass">{{ state.dialog.addTitle }}</h4>
                    <el-button type="primary" size="small" @click="onSubmit(detailsDialogFormRef)">保存</el-button>
                </div>
            </template>
            <el-form ref="detailsDialogFormRef" :rules="rules" :model="state.ruleForm" size="default" label-width="90px">
                <el-row :gutter="35">
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="时间" prop="times">
							<el-date-picker v-model="state.ruleForm.times" type="datetime" placeholder="Select date and time" />
						</el-form-item>
					</el-col>
                    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="违纪内容" prop="describes">
							<el-input v-model="state.ruleForm.describes" :rows="2" type="textarea" placeholder="请输入详细违纪内容" clearable></el-input>
						</el-form-item>
					</el-col>
				</el-row>
            </el-form>
		</el-dialog> -->
	</div>
</template>

<script setup lang="ts" name="schoolDialog">
import { reactive, ref, nextTick } from 'vue';
import { useDetailsApi } from '/@/api/details';
import { ElMessage, FormRules, FormInstance } from 'element-plus';

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

// 定义变量内容
//const detailsDialogFormRef = ref();
const state = reactive({
    // ruleForm: {
    //     sid: null as unknown as number,
    //     times: null,
    //     describes: '',
    // },
    details: [] as any,
	dialog: {
		loading: false,
		isShowDialog: false,
        isAddDialog: false,
		showTitle: '',
	},
});

const rules = reactive<FormRules>({
    times: [
		{ required: true, message: 'Please input time', trigger: 'blur' },
	],
	describes: [
		{ required: true, message: 'Please input content', trigger: 'blur' },
	],
})

// 打开弹窗
const openDialog = (row: any) => {
	//schoolDialogFormRef.value.resetFields();
	state.dialog.isShowDialog = true;
    state.dialog.showTitle = `${row.school_name} / ${row.class_name} / ${row.building}-${row.dormitory_name} / ${row.name} 违纪情况`;
    //state.dialog.addTitle = row.name + ' 新增违纪';
    state.details = []
	nextTick(() => {
	    getStudentDetails(row.id);
    })
    //state.ruleForm.sid = row.id;
};
// 关闭弹窗
const closeDialog = () => {
	state.dialog.isShowDialog = false;
};
// 关闭Add弹窗
const closeAddDialog = () => {
	state.dialog.isAddDialog = false;
};
// 取消
const onCancel = () => {
	closeDialog();
};
// 提交
// const onSubmit = (formEl: FormInstance | undefined) => {
// 	state.dialog.loading = true;
//     if (!formEl) return
// 	formEl.validate((valid, fields) => {
// 		if (valid) {
//             useDetailsApi().add(state.ruleForm).then((res) => {
//                 ElMessage.success(res.message);
//                 state.dialog.loading = false;
//                 closeAddDialog();
//                 //emit('refresh');
//                 getStudentDetails(state.ruleForm.sid);
//             })
//         }
//     })
// };

// 新增违纪
// const addDetails = () => {
//     state.dialog.isAddDialog = true;
//     nextTick(() => {
//         detailsDialogFormRef.value.resetFields();
//     })
// }

// 违纪查询
const getStudentDetails = (id: number) => {
    useDetailsApi().listBySid(0, id).then((res) => {
        state.details = res.data;
    })
}

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
</style>
