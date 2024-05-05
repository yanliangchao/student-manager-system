<template>
	<div class="system-user-dialog-container">
		<el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" width="769px">
			<el-form ref="dormitoryDialogFormRef" :rules="rules" :model="state.ruleForm" size="default" label-width="90px">
				<el-row :gutter="35">
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="寝室" prop="did">
							<el-select v-model="state.ruleForm.did" placeholder="请选择寝室" filterable clearable class="w100">
								<el-option v-for="item in state.dormitorys" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="床号" prop="number">
							<el-input v-model="state.ruleForm.number" placeholder="请输入床号" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="姓名" prop="sid">
							<el-select v-model="state.ruleForm.sid" placeholder="请选择学生" filterable clearable class="w100">
								<el-option v-for="item in state.students" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="时间" prop="times">
							<el-date-picker v-model="state.ruleForm.times" type="datetime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DDTHH:mm:ss.000Z" placeholder="Select date and time"/>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="onCancel(dormitoryDialogFormRef)" size="default">取 消</el-button>
					<el-button type="primary" @click="onSubmit(dormitoryDialogFormRef)" size="default" :loading="state.dialog.loading">{{ state.dialog.submitTxt }}</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="classDialog">
import { reactive, ref, nextTick } from 'vue';
import { useStudentApi } from '/@/api/student';
import { useDormitoryApi } from '/@/api/dormitory';
import { ElMessage, FormRules, FormInstance } from 'element-plus';

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

// 定义变量内容
const dormitoryDialogFormRef = ref();
const state = reactive({
	ruleForm: {
		times: null,
		number: '',
		did: null,
		//name: '',
		sid: null,
	},
	students: [] as SelectOptionType[],
	dormitorys: [] as SelectOptionType[],
	dialog: {
		loading: false,
		isShowDialog: false,
		type: '',
		title: '',
		submitTxt: '',
	},
});

const rules = reactive<FormRules>({
	times: [
		{ required: true, message: 'Please input times', trigger: 'blur' },
	],
	number: [
		{ required: true, message: 'Please input number', trigger: 'blur' },
	],
	did: [
		{ required: true, message: 'Please input dormitory name', trigger: 'blur' },
	],
	sid: [
		{ required: true, message: 'Please input student name', trigger: 'blur' },
	],
})

// 打开弹窗
const openDialog = (type: string, row: DormitoryType) => {
	//dormitoryDialogFormRef.value.resetFields();
	state.dialog.isShowDialog = true;

	state.dialog.title = '加入学生';
	state.dialog.submitTxt = '加 入';
		// 清空表单，此项需加表单验证才能使用
		nextTick(() => {
			dormitoryDialogFormRef.value.resetFields();
		});
	
	nextTick(() => {
		state.dormitorys = [];
		getDormitoryData();
		state.students = [];
		getStudentData();
	})
	//getMenuData();
};
// 关闭弹窗
const closeDialog = () => {
	state.dialog.isShowDialog = false;
};
// 取消
const onCancel = (formEl: FormInstance | undefined) => {
	if (!formEl) return
  	formEl.resetFields()
	closeDialog();
};
// 提交
const onSubmit = (formEl: FormInstance | undefined) => {
	state.dialog.loading = true;
	if (!formEl) return
	formEl.validate((valid, fields) => {
		if (valid) {
			useDormitoryApi().addStu(state.ruleForm).then((res) => {
				ElMessage.success(res.message);
				state.dialog.loading = false;
				closeDialog();
				emit('refresh');
			}).catch(() => {
				state.dialog.loading = false;
			})
		} else {
			state.dialog.loading = false;
		}
	})
	
};

// 获取学生下拉框
const getStudentData = () => {
	if(state.students.length > 0) return;
	useStudentApi().list().then((res) => {
		res.data.forEach((t: { id: number; name: string; }) => {
			state.students.push({
				label: t.name,
				value: t.id,
			})
		});
	})
}
// 获取寝室下拉框
const getDormitoryData = () => {
	if(state.dormitorys.length > 0) return;
	useDormitoryApi().list().then((res) => {
		res.data.forEach((t: { id: number; building:string, name: string; }) => {
			state.dormitorys.push({
				label: t.building + ' - ' + t.name,
				value: t.id,
			})
		});
	})
}

// 暴露变量
defineExpose({
	openDialog,
});
</script>
