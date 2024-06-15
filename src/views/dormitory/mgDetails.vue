<template>
	<div class="system-user-dialog-container">
		<el-dialog v-model="state.dialog.isShowDialog" :close-on-click-modal='false' width="769px" fullscreen>
			<template #header="{ titleId, titleClass }">
				<el-radio-group v-model="state.mgType" size="default">
					<el-radio-button :value="0">评分</el-radio-button>
					<el-radio-button :value="1">点名</el-radio-button>
				</el-radio-group>
			</template>
			<div class="mb20"> 
				<el-text class="mx-1" size="large" type="primary">
					{{ state.dialog.data.building }}-{{ state.dialog.data.storey }}-{{ state.dialog.data.name }} | {{ state.dialog.data.gender == 1 ? '女寝' : '男寝' }}
				</el-text>
			</div>
			<template v-if="state.mgType">
				<div class="mb20">
					<el-text class="mx-1" size="large">
						应到人数: {{ state.dialog.data.sidCount }}
					</el-text>
				</div>
				<el-form ref="mgFormRef" :rules="dianmingRules" :model="state.ruleForm" size="small" style="max-width: 350px">
					<el-row :gutter="35">
						<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
							<el-form-item label="实到人数" prop="number">
								<el-input type="number" v-model="state.ruleForm.number" placeholder="请输入实到人数" clearable></el-input>
							</el-form-item>
						</el-col>
						<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
							<el-form-item label="请假" prop="leaves">
								<el-select v-model="state.ruleForm.leaves" placeholder="请选择学生" multiple filterable clearable class="w100">
									<el-option v-for="item in state.students" :key="item.value" :label="item.label" :value="item.value" />
								</el-select>
							</el-form-item>
						</el-col>
						<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
							<el-form-item label="缺寝" prop="absence">
								<el-select v-model="state.ruleForm.absence" placeholder="请选择学生" multiple filterable clearable class="w100">
									<el-option v-for="item in state.students" :key="item.value" :label="item.label" :value="item.value" />
								</el-select>
							</el-form-item>
						</el-col>
					</el-row>
				</el-form>
			</template>
			<template v-else>
				<el-form ref="mgFormRef" :model="state.pingfen" size="small" label-width="90px">
					<el-row :gutter="35">
						<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb10">
							<el-text class="mx-1" size="large">
								公共卫生:  {{ publicNum }}
							</el-text>
							<el-button @click="addPublicPingfen" type="success" size="small" class="ml10">新增扣分</el-button>
						</el-col>
						<template v-for="(v, k) in state.pingfen.publics">
							<el-col :xs="8" :sm="8" :md="8" :lg="8" :xl="8" class="mb10">
								<el-form-item :key="k" label="扣分" :prop="'publics.' + k + '.number'" size="small" :rules="{ required: true, message: 'Please input', trigger: 'blur' }">
									<el-input type="number" v-model="v.number" placeholder="请输入分数" clearable></el-input>
								</el-form-item>
							</el-col>
							<el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12" class="mb10">
								<el-form-item :key="k" label="原因" :prop="'publics.' + k + '.reason'" size="small" :rules="{ required: true, message: 'Please input', trigger: 'blur' }">
									<!-- <el-input v-model="v.reason" placeholder="请输入扣分原因" clearable></el-input> -->
									<el-select v-model="v.reason" placeholder="请输入扣分原因" filterable clearable class="w100">
										<el-option key="0" label="室内走廊" value="室内走廊" />
										<el-option key="1" label="阳台" value="阳台" />
										<el-option key="2" label="垃圾桶" value="垃圾桶" />
										<el-option key="3" label="洗漱台" value="洗漱台" />
										<el-option key="4" label="厕所" value="厕所" />
										<el-option key="5" label="浴室" value="浴室" />
										<el-option key="6" label="晾衣架" value="晾衣架" />
										<el-option key="7" label="水桶面盆扫把" value="水桶面盆扫把" />
										<el-option key="8" label="用电" value="用电" />
									</el-select>
								</el-form-item>
							</el-col>
							<el-col :xs="4" :sm="2" :md="4" :lg="4" :xl="4" class="mb10 button-center">
								<el-button type="danger" :icon="Delete" circle size="small" @click="deletePingfen(v)"/>
							</el-col>
						</template>
						<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb10">
							<el-text class="mx-1" size="large">
								个人卫生:  {{ personalNum }}
							</el-text>
							
						</el-col>
						<el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12" class="mb10">
							<el-select v-model="state.sid" placeholder="请选择学生" filterable clearable class="w100" size="small" @change="changePersonalPingfen">
								<el-option v-for="item in state.students" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
						</el-col>
						<el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12" class="mb10">
							<el-button @click="addPersonalPingfen" type="success" size="small">新增扣分</el-button>
						</el-col>
						<template v-for="(v, k) in state.personalPingfen.publics">
							<el-col :xs="8" :sm="12" :md="12" :lg="12" :xl="12" class="mb10">
								<el-form-item :key="k" label="扣分" :prop="'publics.' + k + '.number'" size="small">
									<el-input type="number" v-model="v.number" placeholder="请输入分数" clearable></el-input>
								</el-form-item>
							</el-col>
							<el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12" class="mb10">
								<el-form-item :key="k" label="原因" :prop="'publics.' + k + '.reason'" size="small">
									<!-- <el-input v-model="v.reason" placeholder="请输入扣分原因" clearable></el-input> -->
									<el-select v-model="v.reason" placeholder="请输入扣分原因" filterable clearable class="w100">
										<el-option key="0" label="床铺" value="床铺" />
										<el-option key="1" label="桌子" value="桌子" />
										<el-option key="2" label="纪律" value="纪律" />
										<el-option key="3" label="迟到" value="迟到" />
										<el-option key="4" label="违禁品" value="违禁品" />
										<el-option key="5" label="缺寝" value="缺寝" />
									</el-select>
								</el-form-item>
							</el-col>
							<el-col :xs="4" :sm="4" :md="4" :lg="4" :xl="4" class="mb10 button-center">
								<el-button type="danger" :icon="Delete" circle @click="deletePersonalPingfen(v)"/>
							</el-col>
						</template>
					</el-row>
				</el-form>
			</template>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="onCancel(mgFormRef)" size="default" >取 消</el-button>
					<el-button type="primary" @click="onSubmit(mgFormRef)" size="default" :loading="state.dialog.loading">提交</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="classDialog">
import { reactive, ref, nextTick, computed } from 'vue';
import { useDormitoryApi } from '/@/api/dormitory';
import { ElMessage, FormRules, FormInstance } from 'element-plus';
import { Delete } from '@element-plus/icons-vue'

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

// 定义变量内容
const mgFormRef = ref<FormInstance | undefined>();
const state = reactive({
	ruleForm: {
		did: null,
		number: null as unknown as number,
		leaves: [],
		absence: [],
		times: null,
		//name: '',
	},
	sid: null as unknown as number,
	personalPingfen: {
		sid: null as unknown as number,
		publics: [] as Public[],

	},
	pingfen: {
		did: null,
		publics: [] as Public[],
		personals: [] as Personal[],
	},
	mgType: 0,
	students: [] as SelectOptionType[],
	dialog: {
		loading: false,
		isShowDialog: false,
		data: {} as any,
	},
});

const dianmingRules = reactive({
	number: [
		{ required: true, message: 'Please input', trigger: 'blur' },
	],
})

// 计算分数
const publicNum = computed(() => {
	return state.pingfen.publics.reduce((sum, current) => sum + Number(current.number), 0);
})

const personalNum = computed(() => {
	return state.personalPingfen.publics.reduce((sum, current) => sum + Number(current.number), 0);
})


// 打开弹窗
const openDialog = (row: DormitoryType) => {
	//dormitoryDialogFormRef.value.resetFields();
	state.dialog.isShowDialog = true;
	state.dialog.data = row
	state.personalPingfen = {
		sid: null as unknown as number,
		publics: [] as Public[],

	};
	state.pingfen = {
		did: null,
		publics: [] as Public[],
		personals: [] as Personal[],
	};
	nextTick(() => {
		getTableData();
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
// 新增评分
const addPublicPingfen = () => {
	state.pingfen.publics.push({
		number: null as unknown as number,
		reason: "",
	})
}

// 删除评分
const deletePingfen = (item: Public) => {
	const index = state.pingfen.publics.indexOf(item)
	if (index !== -1) {
		state.pingfen.publics.splice(index, 1)
	}
}

// 新增个人评分
const addPersonalPingfen = () => {
	if(state.sid === null) return;
	state.personalPingfen.sid = state.sid;
	state.personalPingfen.publics.push({
		number: null as unknown as number,
		reason: "",
	});
}

// 改变用户
const changePersonalPingfen = () => {
	let flag = false;
	let oldPersonalPingfen = Object.assign({}, state.personalPingfen);
	state.personalPingfen.sid = state.sid
	state.personalPingfen.publics = [];
	if(oldPersonalPingfen.sid == null) return
	state.pingfen.personals.forEach(personal => {
		if(personal.sid === oldPersonalPingfen.sid) {
			personal.publics = oldPersonalPingfen.publics
			flag = true;
		}
		if(personal.sid === state.sid) {
			state.personalPingfen.publics = personal.publics
		}
	})
	if(!flag) {
		state.pingfen.personals.push({
			sid: oldPersonalPingfen.sid,
			publics: oldPersonalPingfen.publics
		})
	};
}

// 删除个人评分
const deletePersonalPingfen = (item: Public) => {
	const index = state.personalPingfen.publics.indexOf(item)
	if (index !== -1) {
		state.personalPingfen.publics.splice(index, 1)
	}
}

// 提交
const onSubmit = (formEl: FormInstance | undefined) => {
	state.dialog.loading = true;
	if (!formEl) return;
	formEl.validate((valid, fields) => {
		if (valid) {
			if(state.mgType) {	
				if(state.dialog.data.sidCount - Number(state.ruleForm.number) - state.ruleForm.leaves.length - state.ruleForm.absence.length > 0) {
					ElMessage.error(`还有${state.dialog.data.sidCount - Number(state.ruleForm.number) - state.ruleForm.leaves.length - state.ruleForm.absence.length}人未录入！！`);
					state.dialog.loading = false;
					return;
				}
				if(state.dialog.data.sidCount - Number(state.ruleForm.number) - state.ruleForm.leaves.length - state.ruleForm.absence.length < 0) {
					ElMessage.error(`多录入了${state.ruleForm.leaves.length + Number(state.ruleForm.number) + state.ruleForm.absence.length - state.dialog.data.sidCount}人！！`);
					state.dialog.loading = false;
					return;
				}
				state.ruleForm.did = state.dialog.data.id
				useDormitoryApi().dianming(state.ruleForm).then((res) => {
					ElMessage.success(res.message);
					state.dialog.loading = false;
					closeDialog();
					emit('refresh');
				}).catch(() => {
					state.dialog.loading = false;
				})
			} else{
				let flag = false;
				let oldPersonalPingfen = Object.assign({}, state.personalPingfen);
				state.pingfen.personals.forEach(personal => {
					if(personal.sid === oldPersonalPingfen.sid) {
						personal.publics = oldPersonalPingfen.publics
						flag = true;
					}
					if(personal.sid === state.sid) {
						state.personalPingfen.publics = personal.publics
					}
				})
				if(!flag && oldPersonalPingfen.sid != null) {
					state.pingfen.personals.push({
						sid: oldPersonalPingfen.sid,
						publics: oldPersonalPingfen.publics
					})
				};
				state.pingfen.did = state.dialog.data.id
				useDormitoryApi().pingfen(state.pingfen).then((res) => {
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

// 初始化表格数据
const getTableData = () => {
	//const data = [];
	state.students = [];
	useDormitoryApi().getStuByid(state.dialog.data.id).then((res) => {
		res.data.forEach((t: { id: number; name: string; number: string }) => {
			state.students.push({
				label: t.number + " - " + t.name,
				value: t.id,
			})
		});
	});
};

// 暴露变量
defineExpose({
	openDialog,
});
</script>
<style>
.el-overlay .el-overlay-dialog .el-dialog .el-dialog__body {
	padding: 0px !important;
}

.button-center {
	display: flex !important;
	align-items: flex-end;
}
</style>
