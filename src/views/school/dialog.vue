<template>
	<div class="system-user-dialog-container">
		<el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" width="769px">
			<el-form ref="schoolDialogFormRef" :rules="rules" :model="state.ruleForm" size="default" label-width="90px">
				<el-row :gutter="35">
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="学校名" prop="school_name">
							<el-input v-model="state.ruleForm.school_name" placeholder="请输入学校名称" clearable></el-input>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="onCancel" size="default">取 消</el-button>
					<el-button type="primary" @click="onSubmit" size="default" :loading="state.dialog.loading">{{ state.dialog.submitTxt }}</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="schoolDialog">
import { reactive, ref, nextTick } from 'vue';
import { useSchoolApi } from '/@/api/school';
import { ElMessage, FormRules } from 'element-plus';

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

// 定义变量内容
const schoolDialogFormRef = ref();
const state = reactive({
	ruleForm: {
		school_name: '', // 账户名称
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
	dialog: {
		loading: false,
		isShowDialog: false,
		type: '',
		title: '',
		submitTxt: '',
	},
});

const rules = reactive<FormRules<SchoolType>>({
	school_name: [
		{ required: true, message: 'Please input school name', trigger: 'blur' },
	],
})

// 打开弹窗
const openDialog = (type: string, row: SchoolType) => {
	//schoolDialogFormRef.value.resetFields();
	state.dialog.type = type;
	state.dialog.isShowDialog = true;
	if (type === 'edit') {
		nextTick(() => {
			state.ruleForm = JSON.parse(JSON.stringify(row));
		});
		state.dialog.title = '修改学校';
		state.dialog.submitTxt = '修 改';
	} else {
		state.dialog.title = '新增学校';
		state.dialog.submitTxt = '新 增';
		// 清空表单，此项需加表单验证才能使用
		nextTick(() => {
			schoolDialogFormRef.value.resetFields();
		});
	}
	//getMenuData();
};
// 关闭弹窗
const closeDialog = () => {
	state.dialog.isShowDialog = false;
};
// 取消
const onCancel = () => {
	closeDialog();
};
// 提交
const onSubmit = () => {
	state.dialog.loading = true;
	if (state.dialog.type === 'add') { 
		useSchoolApi().add(state.ruleForm).then((res) => {
			ElMessage.success(res.message);
			state.dialog.loading = false;
			closeDialog();
			emit('refresh');
		})
	} else {
		useSchoolApi().mod(state.ruleForm).then((res) => {
			ElMessage.success(res.message);
			state.dialog.loading = false;
			closeDialog();
			emit('refresh');
		})
	}
};

// 暴露变量
defineExpose({
	openDialog,
});
</script>
