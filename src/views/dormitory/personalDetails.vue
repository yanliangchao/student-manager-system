<template>
    <div class="system-user-dialog-container">
        <el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" :close-on-click-modal='false'
            width="60%">
            <template #header="{ titleId, titleClass }">
                <div class="my-header">
                    <h4 :id="titleId" :class="titleClass">{{ state.dialog.title }}</h4>
                </div>
            </template>
            <el-form  ref="printDialogFormRef" :rules="rules" :model="state.ruleForm" size="default" label-width="120px">
                <el-row :gutter="35">
                    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
                        <el-form-item label="选择打印时间段" prop="times">
                            <el-date-picker v-model="state.ruleForm.times" type="daterange" unlink-panels range-separator="To" start-placeholder="Start date" end-placeholder="End date" :shortcuts="shortcuts" size="small" />
                        </el-form-item>
                    </el-col>
                </el-row>
                
                
            </el-form>
            <template #footer>
				<span class="dialog-footer">
					<el-button @click="onCancel(printDialogFormRef)" size="default">取 消</el-button>
					<el-button type="primary" @click="print(printDialogFormRef)" size="default" :loading="state.dialog.loading">{{ state.dialog.submitTxt }}</el-button>
				</span>
			</template>
        </el-dialog>
        <div ref="printRef" v-show="false">
            <div class="header-title mb20">
                <h2>{{ state.dialog.data.school_name }} 润德教育学生公寓常规检查记录表</h2>
            </div>
            <div class="signature mb20"><span>{{ formatDate(state.ruleForm.times[0]) }} - {{ formatDate(state.ruleForm.times[1]) }}</span><span>{{ state.dialog.data.building }}-{{ state.dialog.data.storey }}-{{ state.dialog.data.name }}</span></div>
            <table>
                <tbody>
                    <tr>
                        <th>姓名</th>
                        <th>内容</th>
                    </tr>
                    <tr>
                        <td>公共卫生</td>
                        <td><p  v-for="(item, index) in state.print.public" :key="index">{{ item }}</p></td>
                    </tr>
                    <tr v-for="(v, k) in state.print.personal">
                        <td>{{ v.name }}</td>
                        <td>
                            <p v-if="v.details.length === 0">优秀！</p>
                            <p v-else v-for="(item, index) in v.details" :key="index">{{ item }}</p>
                        </td>
                    </tr>
                    <!-- 你可以根据需要添加更多的数据行 -->
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup lang="ts" name="classDialog">
import { reactive, ref, nextTick } from 'vue';
import { useDormitoryApi } from '/@/api/dormitory';
import { ElMessage, FormInstance, FormRules } from 'element-plus';


// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

// 定义变量内容
// 定义变量内容
const printDialogFormRef = ref();
const printRef = ref();
const state = reactive({
    ruleForm: {
        times: '',
    },
    print: {
        public: [],
        personal: [{
            name: '',
            details: [],
        }]
    },
    dialog: {
        isShowDialog: false,
        title: '',
        data: {} as any,
        loading: false,
		type: '',
		submitTxt: '',
    },
});

const rules = reactive<FormRules>({
	times: [
		{ required: true, message: 'Please input building', trigger: 'change' },
	],
})


const shortcuts = [
    {
        text: 'Last day',
        value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24)
            return [start, end]
        },
    },
    {
        text: 'Last 3 day',
        value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 3)
            return [start, end]
        },
    },
    {
        text: 'Last week',
        value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            return [start, end]
        },
    },
    {
        text: 'Last month',
        value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            return [start, end]
        },
    },
]

// 打开弹窗
const openDialog = (row: any) => {
    //classDialogFormRef.value.resetFields();
    state.dialog.isShowDialog = true;
    state.dialog.title = `宿舍评分打印`;
    state.dialog.submitTxt = '打 印';
    state.dialog.data = row;
    // 清空表单，此项需加表单验证才能使用
    nextTick(() => {
        printDialogFormRef.value.resetFields();
    });
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


// 打印
const print = (formEl: FormInstance | undefined) => {
	if (!formEl) return
    state.dialog.loading = true;
	formEl.validate(async (valid, fields) => {
        if(valid) {
            await useDormitoryApi().personalPrint(state.dialog.data.id, state.ruleForm).then((res) => {
                ElMessage.success(res.message);
                state.print = res.data
            })
            state.dialog.loading = false;
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
        } else {
            state.dialog.loading = false;
        }
        
    })
};

//格式化时间
const formatDate = (data: string) => {
    const date = new Date(data);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return  `${year}-${month}-${day}`;// 使用浏览器的本地时间格式
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

    th,
    td {
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
