export default defineAppConfig({
  pages: [
    'pages/pending/index',
    'pages/progress/index',
    'pages/records/index',
    'pages/review/index',
    'pages/supplement/index',
    'pages/detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1D6FE0',
    navigationBarTitleText: '政务回访',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F4F6FA'
  },
  tabBar: {
    color: '#8C8C8C',
    selectedColor: '#1D6FE0',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/pending/index',
        text: '待确认'
      },
      {
        pagePath: 'pages/progress/index',
        text: '进度查询'
      },
      {
        pagePath: 'pages/records/index',
        text: '回访记录'
      },
      {
        pagePath: 'pages/review/index',
        text: '结果评价'
      }
    ]
  }
})
