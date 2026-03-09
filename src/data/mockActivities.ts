import type { Activity } from '../types/domain';

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: '1',
    title: '量子计算入门导论.pdf',
    time: '2 小时前',
    detail: '已提取 42 个实体',
    type: 'file',
  },
  {
    id: '2',
    title: '建立“神经网络”与“深度学习”的关联',
    time: '5 小时前',
    detail: '自动推荐关联',
    type: 'link',
  },
];
