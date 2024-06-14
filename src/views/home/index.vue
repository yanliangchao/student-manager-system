<template>
	<div class="home-container layout-pd">
		<el-row :gutter="15" class="home-card-one mb15">
			<el-col
				:xs="24"
				:sm="12"
				:md="12"
				:lg="6"
				:xl="6"
				v-for="(v, k) in state.homeOne"
				:key="k"
				:class="{ 'home-media home-media-lg': k > 1, 'home-media-sm': k === 1 }"
			>
				<div class="home-card-item flex">
					<div class="flex-margin flex w100" :class="` home-one-animation${k}`">
						<div class="flex-auto">
							<span class="font30">{{ v.num1 }}</span>
							<!-- <span class="ml5 font16" :style="{ color: v.color1 }">{{ v.num2 }}%</span> -->
							<div class="mt10">{{ v.num3 }}</div>
						</div>
						<div class="home-card-item-icon flex" :style="{ background: `var(${v.color2})` }">
							<i class="flex-margin font32" :class="v.num4" :style="{ color: `var(${v.color3})` }"></i>
						</div>
					</div>
				</div>
			</el-col>
		</el-row>
		<el-row :gutter="15" class="home-card-three mb15">
			<el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12" class="home-media">
				<div class="home-card-item">
					<div class="title">今日请假学生</div>
					<el-table ref="schoolTableRef" :data="state.global.leveaStu" v-loading="state.global.loading" highlight-current-row size="small" style="width: 100%">
						<el-table-column type="index" label="序号" width="80" />
						<el-table-column prop="class_name" label="班级" show-overflow-tooltip></el-table-column>
						<el-table-column label="宿舍" show-overflow-tooltip>
							<template #default="scope">
								{{ scope.row.building }}-{{ scope.row.storey }}-{{ scope.row.tdm_name }}
							</template>
						</el-table-column>
						<el-table-column prop="name" label="学生" show-overflow-tooltip></el-table-column>
						<el-table-column prop="username" label="审批老师" show-overflow-tooltip></el-table-column>
					</el-table>
				</div>
			</el-col>
			<el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12" class="home-media">
				<div class="home-card-item">
					<div class="title">老师评分统计</div>
					<el-table :data="state.global.teaPinfen" v-loading="state.global.loading" highlight-current-row size="small" style="width: 100%">
						<el-table-column type="index" label="序号" width="80" />
						<el-table-column prop="username" label="生活老师" show-overflow-tooltip></el-table-column>
						<el-table-column prop="tdmCount" label="宿舍数量" show-overflow-tooltip></el-table-column>
						<el-table-column prop="tsuCount" label="学生数量" show-overflow-tooltip></el-table-column>
						<el-table-column prop="avg" label="宿舍平均评分" show-overflow-tooltip></el-table-column>
						<el-table-column prop="totalTime" label="评分总用时" show-overflow-tooltip></el-table-column>
						<el-table-column label="评分平均用时" show-overflow-tooltip>
							<template #default="scope">
								{{ scope.row.totalTime.includes('未评分') ? '请及时评分!' :  (scope.row.totalTime/scope.row.tdmCount).toFixed(2) }} 
							</template>
						</el-table-column>
					</el-table>
				</div>
			</el-col>
		</el-row>
		<el-row :gutter="15" class="home-card-three">
			<el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12" class="home-media">
				<div class="home-card-item">
					<div style="height: 100%" ref="classBarRef"></div>
				</div>
			</el-col>
			<el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12" class="home-media">
				<div class="home-card-item">
					<div style="height: 100%" ref="dormitoryBarRef"></div>
				</div>
			</el-col>
		</el-row>
	</div>
</template>

<script setup lang="ts" name="home">
import { reactive, onMounted, ref, watch, nextTick, onActivated, markRaw } from 'vue';
import * as echarts from 'echarts';
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '/@/stores/themeConfig';
import { useTagsViewRoutes } from '/@/stores/tagsViewRoutes';
import { useHomeApi } from '/@/api/home'
import { ElTable } from 'element-plus';

// 定义变量内容
const dormitoryBarRef = ref();
const classBarRef = ref();
const schoolTableRef = ref<InstanceType<typeof ElTable>>()
const storesTagsViewRoutes = useTagsViewRoutes();
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);
const { isTagsViewCurrenFull } = storeToRefs(storesTagsViewRoutes);
const state = reactive({
	global: {
		leveaStu: [],
		teaPinfen: [],
		schoolCount: [],
		teacherCount: [],
		homeCharClass: null,
		homeCharDormitory: null,
		dispose: [null, '', undefined],
	} as any,
	homeOne: [{
		num1: 0,
		num3: '',
		num4: '',
		color1: '',
		color2: '',
		color3: '',
	}],
	dormitoryCount: {
		xAxis: '',
		yAxis: ''
	},
	classCount: {
		xAxis: '',
		yAxis: ''
	},
	loading: false,
	myCharts: [] as EmptyArrayType,
	charts: {
		theme: '',
		bgColor: '',
		color: '#303133',
	},
});

const getHomeOne = () => {
	useHomeApi().getCount().then((res) => {
		state.homeOne = res.data
	}) 
}
// 选择用户行
const handleCurrentChange = (val: any) => {
	//getTeacherCount(val.id);
	getDormitoryCount(val.id);
	getClassCount(val.id);
}

const getLeaveStu = () => {
	useHomeApi().getLeave().then((res) => {
		state.global.leveaStu = res.data
		//schoolTableRef.value!.setCurrentRow(state.global.schoolCount[0])
	}) 
}

const getTeacherCount = () => {
	useHomeApi().getTeacherPinfen().then((res) => {
		state.global.teaPinfen = res.data
	}) 
}

const getDormitoryCount = (id: number) => {
	useHomeApi().getDormitoryCount(id).then((res) => {
		state.dormitoryCount = res.data
		setTimeout(() => {
			initDormitoryBarChart();
		}, 1000);
	}) 
}

const getClassCount = (id: number) => {
	useHomeApi().getClassCount(id).then((res) => {
		state.classCount = res.data
		setTimeout(() => {
			initClassBarChart();
		}, 1000);
	}) 
}

// 柱状图
const initClassBarChart = () => {
	if (!state.global.dispose.some((b: any) => b === state.global.homeCharClass)) state.global.homeCharClass.dispose();
	state.global.homeCharClass = markRaw(echarts.init(classBarRef.value, state.charts.theme));
	const option = {
		backgroundColor: state.charts.bgColor,
		title: {
			text: '班级违纪统计',
			x: 'left',
			textStyle: { fontSize: '15', color: state.charts.color },
		},
		tooltip: { trigger: 'axis' },
		legend: { data: ['数量'], right: 0 },
		grid: { top: 70, right: 80, bottom: 30, left: 80 },
		xAxis: [
			{
				type: 'category',
				data: state.classCount.xAxis,
				boundaryGap: true,
				axisTick: { show: false },
			},
		],
		yAxis: [
			{
				//name: '压力值(Mpa)',
				nameLocation: 'middle',
				nameTextStyle: { padding: [5, 4, 5, 6] },
				splitLine: { show: false },
				axisLine: { show: false },
				axisTick: { show: false },
				axisLabel: { color: state.charts.color, formatter: '{value} ' },
			},
		],
		series: [
			{
				name: '数量',
				type: 'bar',
				barWidth: 30,
				yAxisIndex: 0,
				itemStyle: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: 'rgba(108,80,243,0.3)' },
						{ offset: 1, color: 'rgba(108,80,243,0)' },
					]),
					//柱状图圆角
					borderRadius: [30, 30, 0, 0],
				},
				data: state.classCount.yAxis,
			},
		],
	};
	state.global.homeCharClass.setOption(option);
	state.myCharts.push(state.global.homeCharClass);
};
const initDormitoryBarChart = () => {
	if (!state.global.dispose.some((b: any) => b === state.global.homeCharDormitory)) state.global.homeCharDormitory.dispose();
	state.global.homeCharDormitory = markRaw(echarts.init(dormitoryBarRef.value, state.charts.theme));
	const option = {
		backgroundColor: state.charts.bgColor,
		title: {
			text: '寝室违纪统计',
			x: 'left',
			textStyle: { fontSize: '15', color: state.charts.color },
		},
		tooltip: { trigger: 'axis' },
		legend: { data: ['数量'], right: 0 },
		grid: { top: 70, right: 80, bottom: 30, left: 80 },
		xAxis: [
			{
				type: 'category',
				data: state.dormitoryCount.xAxis,
				boundaryGap: true,
				axisTick: { show: false },
			},
		],
		yAxis: [
			{
				//name: '压力值(Mpa)',
				nameLocation: 'middle',
				nameTextStyle: { padding: [5, 4, 5, 6] },
				splitLine: { show: false },
				axisLine: { show: false },
				axisTick: { show: false },
				axisLabel: { color: state.charts.color, formatter: '{value} ' },
			},
		],
		series: [
			{
				name: '数量',
				type: 'bar',
				barWidth: 30,
				yAxisIndex: 0,
				itemStyle: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: 'rgba(108,80,243,0.3)' },
						{ offset: 1, color: 'rgba(108,80,243,0)' },
					]),
					//柱状图圆角
					borderRadius: [30, 30, 0, 0],
				},
				data: state.dormitoryCount.yAxis,
			},
		],
	};
	state.global.homeCharDormitory.setOption(option);
	state.myCharts.push(state.global.homeCharDormitory);
};
// 批量设置 echarts resize
const initEchartsResizeFun = () => {
	nextTick(() => {
		for (let i = 0; i < state.myCharts.length; i++) {
			setTimeout(() => {
				state.myCharts[i].resize();
			}, i * 1000);
		}
	});
};
// 批量设置 echarts resize
const initEchartsResize = () => {
	window.addEventListener('resize', initEchartsResizeFun);
};
// 页面加载时
onMounted(() => {
	initEchartsResize();
	getHomeOne();
	getLeaveStu();
	getTeacherCount();	
});
// 由于页面缓存原因，keep-alive
onActivated(() => {
	initEchartsResizeFun();
});
// 监听 pinia 中的 tagsview 开启全屏变化，重新 resize 图表，防止不出现/大小不变等
watch(
	() => isTagsViewCurrenFull.value,
	() => {
		initEchartsResizeFun();
	}
);
// 监听 pinia 中是否开启深色主题
watch(
	() => themeConfig.value.isIsDark,
	(isIsDark) => {
		nextTick(() => {
			state.charts.theme = isIsDark ? 'dark' : '';
			state.charts.bgColor = isIsDark ? 'transparent' : '';
			state.charts.color = isIsDark ? '#dadada' : '#303133';
			setTimeout(() => {
				initDormitoryBarChart();
			}, 1000);
			setTimeout(() => {
				initClassBarChart();
			}, 1000);
		});
	},
	{
		deep: true,
		immediate: true,
	}
);
</script>

<style scoped lang="scss">
.title {
	font-size: 15px;
	font-weight:bold;
	margin-bottom: 10px;
}

$homeNavLengh: 8;
.home-container {
	overflow: hidden;
	.home-card-one,
	.home-card-two,
	.home-card-three {
		.home-card-item {
			width: 100%;
			height: 130px;
			border-radius: 4px;
			transition: all ease 0.3s;
			padding: 20px;
			overflow: hidden;
			background: var(--el-color-white);
			color: var(--el-text-color-primary);
			border: 1px solid var(--next-border-color-light);
			&:hover {
				box-shadow: 0 2px 12px var(--next-color-dark-hover);
				transition: all ease 0.3s;
			}
			&-icon {
				width: 70px;
				height: 70px;
				border-radius: 100%;
				flex-shrink: 1;
				i {
					color: var(--el-text-color-placeholder);
				}
			}
			&-title {
				font-size: 15px;
				font-weight: bold;
				height: 30px;
			}
		}
	}
	.home-card-one {
		@for $i from 0 through 3 {
			.home-one-animation#{$i} {
				opacity: 0;
				animation-name: error-num;
				animation-duration: 0.5s;
				animation-fill-mode: forwards;
				animation-delay: calc($i/4) + s;
			}
		}
	}
	.home-card-two,
	.home-card-three {
		.home-card-item {
			height: 400px;
			width: 100%;
			overflow: hidden;
			.home-monitor {
				height: 100%;
				.flex-warp-item {
					width: 25%;
					height: 111px;
					display: flex;
					.flex-warp-item-box {
						margin: auto;
						text-align: center;
						color: var(--el-text-color-primary);
						display: flex;
						border-radius: 5px;
						background: var(--next-bg-color);
						cursor: pointer;
						transition: all 0.3s ease;
						&:hover {
							background: var(--el-color-primary-light-9);
							transition: all 0.3s ease;
						}
					}
					@for $i from 0 through $homeNavLengh {
						.home-animation#{$i} {
							opacity: 0;
							animation-name: error-num;
							animation-duration: 0.5s;
							animation-fill-mode: forwards;
							animation-delay: calc($i/10) + s;
						}
					}
				}
			}
		}
	}
}
</style>
