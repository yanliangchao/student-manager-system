<template>
	<div class="system-user-dialog-container">
		<el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" width="769px">
			<el-form ref="dormitoryDialogFormRef" :rules="rules" :model="state.ruleForm" size="default" label-width="90px">
				<el-row :gutter="35">
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="楼栋" prop="building">
							<el-input v-model="state.ruleForm.building" placeholder="请输入楼栋" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="寝室号" prop="name">
							<el-input v-model="state.ruleForm.name" placeholder="请输入寝室号" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="寝室长" prop="mid">
							<el-select v-model="state.ruleForm.mid" placeholder="请选择寝室长" filterable clearable class="w100">
								<el-option v-for="item in state.students" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="学校名" prop="sid">
							<el-select v-model="state.ruleForm.sid" placeholder="请选择学校" filterable clearable class="w100">
								<el-option v-for="item in state.schools" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
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
import { useSchoolApi } from '/@/api/school';
import { useStudentApi } from '/@/api/student';
import { useDormitoryApi } from '/@/api/dormitory';
import { ElMessage, FormRules, FormInstance } from 'element-plus';

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

// 定义变量内容
const dormitoryDialogFormRef = ref();
const state = reactive({
	ruleForm: {
		building: '',
		name: '',
		mid: null,
		//name: '',
		sid: null,
	},
	schools: [] as SelectOptionType[],
	students: [] as SelectOptionType[],
	dialog: {
		loading: false,
		isShowDialog: false,
		type: '',
		title: '',
		submitTxt: '',
	},
});

const rules = reactive<FormRules<DormitoryType>>({
	building: [
		{ required: true, message: 'Please input building', trigger: 'blur' },
	],
	name: [
		{ required: true, message: 'Please input code', trigger: 'blur' },
	],
	sid: [
		{ required: true, message: 'Please input school name', trigger: 'blur' },
	],
})

// 打开弹窗
const openDialog = (type: string, row: DormitoryType) => {
	//dormitoryDialogFormRef.value.resetFields();
	state.dialog.type = type;
	state.dialog.isShowDialog = true;
	if (type === 'edit') {
		nextTick(() => {
			state.ruleForm = JSON.parse(JSON.stringify(row));
		});
		state.dialog.title = '修改寝室';
		state.dialog.submitTxt = '修 改';
	} else {
		state.dialog.title = '新增寝室';
		state.dialog.submitTxt = '新 增';
		// 清空表单，此项需加表单验证才能使用
		nextTick(() => {
			dormitoryDialogFormRef.value.resetFields();
		});
	}
	nextTick(() => {
		state.schools = [];
		state.students = [];
		getSchoolData();
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
			if (state.dialog.type === 'add') { 
				useDormitoryApi().add(state.ruleForm).then((res) => {
					ElMessage.success(res.message);
					state.dialog.loading = false;
					closeDialog();
					emit('refresh');
				}).catch(() => {
					state.dialog.loading = false;
				})
			} else {
				useDormitoryApi().mod(state.ruleForm).then((res) => {
					ElMessage.success(res.message);
					state.dialog.loading = false;
					closeDialog();
					emit('refresh');
				}).catch(() => {
					state.dialog.loading = false;
				})
			}
		} else {
			state.dialog.loading = false;
		}
	})
	
};
// 获取学校下拉框
const getSchoolData = () => {
	if(state.schools.length > 0) return;
	useSchoolApi().list().then((res) => {
		res.data.forEach((s: { id: number; school_name: string; }) => {
			state.schools.push({
				label: s.school_name,
				value: s.id,
			})
		});
	})
}
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

// 暴露变量
defineExpose({
	openDialog,
});
</script>
