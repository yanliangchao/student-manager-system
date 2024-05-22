<template>
	<div class="system-user-dialog-container">
		<el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" width="769px">
			<el-form ref="userDialogFormRef" :rules="rules" :model="state.ruleForm" size="default" label-width="90px">
				<el-row :gutter="35">
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="用户名" prop="username">
							<el-input v-model="state.ruleForm.username" placeholder="请输入用户名" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="密码" prop="password">
							<!-- <el-input v-model="state.ruleForm.password" placeholder="请输入密码" clearable></el-input> -->
							<el-input
								:type="state.isShowPassword ? 'text' : 'password'"
								:placeholder="$t('message.account.accountPlaceholder2')"
								v-model="state.ruleForm.password"
								autocomplete="off"
							>
								<template #prefix>
									<el-icon class="el-input__icon"><ele-Unlock /></el-icon>
								</template>
								<template #suffix>
									<i
										class="iconfont el-input__icon login-content-password"
										:class="state.isShowPassword ? 'icon-yincangmima' : 'icon-xianshimima'"
										@click="state.isShowPassword = !state.isShowPassword"
									>
									</i>
								</template>
							</el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="学校名" prop="sid">
							<el-select v-model="state.ruleForm.sid" placeholder="请选择学校" filterable clearable class="w100" :disabled="state.disabled">
								<el-option v-for="item in state.schools" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="角色" prop="role">
							<el-select v-model="state.ruleForm.role" placeholder="请选择角色" filterable clearable class="w100" :disabled="state.disabled">
								<el-option key="manager" label="manager" value="manager" />
								<el-option key="user" label="user" value="user" />
							</el-select>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="onCancel" size="default">取 消</el-button>
					<el-button type="primary" @click="onSubmit(userDialogFormRef)" size="default">{{ state.dialog.submitTxt }}</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="systemUserDialog">
import { reactive, ref, nextTick } from 'vue';
import { ElMessage, FormRules, FormInstance } from 'element-plus';
import { useUserApi } from '/@/api/user';
import { useSchoolApi } from '/@/api/school';
import { useUserInfo } from '/@/stores/userInfo';
import { storeToRefs } from 'pinia';


// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

// 定义变量内容
const stores = useUserInfo();
const { userInfos } = storeToRefs(stores);
const userDialogFormRef = ref();
const state = reactive({
	isShowPassword: false,
	disabled: false,
	ruleForm: {
		username: '', // 账户名称
		password: '', // 
		sid: null,
		role: '',
	},
	schools: [] as SelectOptionType[],
	dialog: {
		isShowDialog: false,
		loading: false,
		type: '',
		title: '',
		submitTxt: '',
	},
});

const rules = reactive<FormRules<RowUserType>>({
	username: [
		{ required: true, message: 'Please input username', trigger: 'blur' },
	],
	sid: [
		{ required: true, message: 'Please select school', trigger: 'blur' },
	],
	role: [
		{ required: true, message: 'Please select role', trigger: 'blur' },
	],
})

// 打开弹窗
const openDialog = (type: string, row: RowUserType) => {
	state.dialog.type = type;
	state.dialog.isShowDialog = true;
	if(userInfos.value.roles[0] === 'manager') {
		state.ruleForm.role = 'user'
		state.ruleForm.sid = userInfos.value.school
		state.disabled = true
	}
	if (type === 'edit') {
		state.ruleForm = JSON.parse(JSON.stringify(row));
		state.dialog.title = '修改用户';
		state.dialog.submitTxt = '修 改';
	} else {
		state.dialog.title = '新增用户';
		state.dialog.submitTxt = '新 增';
		// 清空表单，此项需加表单验证才能使用
		nextTick(() => {
			userDialogFormRef.value.resetFields();
		});
	}
	nextTick(() => {
		state.schools = [];;
		getSchoolData();
	})
	
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
const onSubmit = (formEl: FormInstance | undefined) => {
	state.dialog.loading = true;
	if (!formEl) return
	formEl.validate((valid, fields) => {
		if (valid) {
			if (state.dialog.type === 'add') { 
				useUserApi().add(state.ruleForm).then((res) => {
					ElMessage.success(res.message);
					state.dialog.loading = false;
					closeDialog();
					emit('refresh');
				}).catch(() => {
					state.dialog.loading = false;
				})
			} else {
				useUserApi().mod(state.ruleForm).then((res) => {
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

// 暴露变量
defineExpose({
	openDialog,
});
</script>
