// block -> section -> project

export const BlockDefination = [
  {
    blockId: 1,
    sections: [
      {
        sectionId: 1,
        title: '实用工具',
        projects: [
          {
            url: 'https://github.com/daidr/paimon-webext',
            title: '派蒙浏览器扩展',
            description:
              '在浏览器中查看原神树脂信息，不错的UI&还行的本地化支持，你会喜欢的。',
            image: '/images/projects/paimon-webext.png',
            time: '2022',
          },
          {
            url: 'https://dt.daidr.me',
            title: '双色调烘焙师',
            description: '为图片加上双色调滤镜，灵感来自于iOS 16锁屏。',
            image: '/images/projects/dt.daidr.me.png',
            time: '2022',
          },
          {
            url: 'https://font.daidr.me',
            title: '中文字体分片',
            description: '将中文字体根据汉字使用频率切片，方便在网页中使用。',
            image: '/images/projects/font.daidr.me.png',
            time: '2022',
          },
          {
            url: 'https://tb.daidr.me',
            title: '真值表生成器',
            description:
              '根据输入的逻辑表达式生成真值表，是玩Antlr时的即兴作品。',
            image: '/images/projects/tb.daidr.me.png',
            time: '2022',
          },
          {
            url: 'https://guild-beta.daidr.me',
            title: '[私有]DouGuild',
            description: '校园自治频道数据分析，只是为了学一学ElasticSearch。',
            image: '/images/projects/guild-beta.daidr.me.png',
            time: '2022',
          },
          {
            url: 'https://lsb.daidr.me',
            title: '图片LSB查看器',
            description:
              '在线查看图片通道的LSB信息，没什么用，功能没有StegSolve丰富。',
            image: '/images/projects/lsb.daidr.me.png',
            time: '2020',
          },
          {
            url: 'https://ink.daidr.me',
            title: 'DouBoard',
            description:
              '支持压感的在线白板，只是当时觉得微软白板很好看，临摹了一下。',
            image: '/images/projects/ink.daidr.me.png',
            time: '2020',
          },
        ],
      },
      {
        sectionId: 2,
        title: '预部署项目',
        projects: [
          {
            url: 'https://auth.daidr.me',
            title: 'GHAuth',
            description:
              '「基佬之家」MC服务器自用的身份认证系统。开源项目同名，拥有完整的Yggdrasil协议实现。',
            image: '/images/projects/auth.daidr.me.png',
            time: '2020',
          },
          {
            url: 'https://api.daidr.me',
            title: 'DouAPI',
            description: '长期维护的API接口，自用但是公开，也许会有用。',
            image: '/images/projects/api.daidr.me.png',
            time: '2015',
          },
        ],
      },
      {
        sectionId: 3,
        title: '参与开发',
        projects: [
          {
            url: 'https://www.fastmirror.net',
            title: '[前端]FastMirror',
            description: '公益性质的MC核心镜像站，由「物语云计算」运营。',
            image: '/images/projects/www.fastmirror.net.png',
            time: '2022',
          },
          {
            url: 'https://modpack.daidr.me',
            title: '[前端]MC整合包聚合',
            description: 'CurseForge整合包聚合，后端由MidCoard实现。',
            image: '/images/projects/modpack.daidr.me.png',
            time: '2022',
          },
        ],
      },
    ],
  },
]
