<template>
	<div class="system-user-dialog-container">
		<el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" width="769px">
			<el-form ref="classDialogFormRef" :rules="rules" :model="state.ruleForm" size="default" label-width="90px">
				<el-row :gutter="35">
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="班级号" prop="class_id">
							<el-input v-model="state.ruleForm.class_id" placeholder="请输入班级号" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="班级名" prop="class_name">
							<el-input v-model="state.ruleForm.class_name" placeholder="请输入班级名" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="班主任" prop="tid">
							<el-select v-model="state.ruleForm.tid" placeholder="请选择班主任" filterable clearable class="w100">
								<el-option v-for="item in state.teachers" :key="item.value" :label="item.label" :value="item.value" />
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
					<el-button @click="onCancel(classDialogFormRef)" size="default">取 消</el-button>
					<el-button type="primary" @click="onSubmit(classDialogFormRef)" size="default" :loading="state.dialog.loading">{{ state.dialog.submitTxt }}</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="classDialog">
import { reactive, ref, nextTick } from 'vue';
import { useSchoolApi } from '/@/api/school';
import { useTeacherApi } from '/@/api/teacher';
import { useClassApi } from '/@/api/class';
import { ElMessage, FormRules, FormInstance } from 'element-plus';

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

// 定义变量内容
const classDialogFormRef = ref();
const state = reactive({
	ruleForm: {
		class_id: '',
		class_name: '',
		tid: null,
		//name: '',
		sid: null,
		//school_name: '', // 账户名称
		// userNickname: '', // 用户昵称
		// roleSign: '', // 关联角色
		// department: [] as string[], // 部门
		// phone: '', // 手机号
		// email: '', // 邮箱
		// sex: '', // 性别
		// password: '', // 账户密码
		// overdueTime: '', // 账户过期
		// status: true, // 用户状态
		// describe: '', // 用户描述
	},
	schools: [] as SelectOptionType[],
	teachers: [] as SelectOptionType[],
	dialog: {
		loading: false,
		isShowDialog: false,
		type: '',
		title: '',
		submitTxt: '',
	},
});

const rules = reactive<FormRules<ClassType>>({
	class_id: [
		{ required: true, message: 'Please input class code', trigger: 'blur' },
	],
	class_name: [
		{ required: true, message: 'Please input class name', trigger: 'blur' },
	],
	sid: [
		{ required: true, message: 'Please input school name', trigger: 'blur' },
	],
})

// 打开弹窗
const openDialog = (type: string, row: ClassType) => {
	//classDialogFormRef.value.resetFields();
	state.dialog.type = type;
	state.dialog.isShowDialog = true;
	if (type === 'edit') {
		nextTick(() => {
			state.ruleForm = JSON.parse(JSON.stringify(row));
		});
		state.dialog.title = '修改用户';
		state.dialog.submitTxt = '修 改';
	} else {
		state.dialog.title = '新增用户';
		state.dialog.submitTxt = '新 增';
		// 清空表单，此项需加表单验证才能使用
		nextTick(() => {
			classDialogFormRef.value.resetFields();
		});
	}
	nextTick(() => {
		state.schools = [];
		state.teachers = [];
		getTeacherData();
		getSchoolData();
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
				useClassApi().add(state.ruleForm).then((res) => {
					ElMessage.success(res.message);
					state.dialog.loading = false;
					closeDialog();
					emit('refresh');
				}).catch(() => {
					state.dialog.loading = false;
				})
			} else {
				useClassApi().mod(state.ruleForm).then((res) => {
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
// 获取老师下拉框
const getTeacherData = () => {
	if(state.teachers.length > 0) return;
	useTeacherApi().list().then((res) => {
		res.data.forEach((t: { id: number; teacher_name: string; }) => {
			state.teachers.push({
				label: t.teacher_name,
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
