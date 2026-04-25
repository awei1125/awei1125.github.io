window.BYTELOG_POSTS = [
  {
    id: 'rust-ownership',
    title: '深入理解 Rust 所有權機制與記憶體安全',
    theme: { slug: 'system-programming', name: '系統程式' },
    tags: [
      { slug: 'rust', name: 'Rust' },
      { slug: 'system-programming', name: '系統程式' }
    ],
    date: '2025 年 4 月 18 日',
    read: '閱讀時間 12 分鐘',
    icon: '🦀',
    featured: true,
    url: '/post/system-programming/rust-ownership/',
    excerpt: '從 borrow checker 的核心邏輯出發，理解 lifetime 標注背後的設計哲學，並透過實際案例探討如何在不犧牲效能的前提下達到安全性。',
    paragraphs: [
      'Rust 的所有權模型把記憶體安全從執行期錯誤提前到編譯期。這讓程式在沒有垃圾回收器的情況下，仍然能避免 use-after-free、double free 與資料競爭。',
      '理解 borrow checker 時，不要先把 lifetime 視為語法負擔。它其實是在描述引用有效範圍，讓編譯器能確認借用者不會活得比資料本身更久。',
      '實務上，先用清楚的資料所有者設計模組邊界，再用不可變借用作為預設；只有在真的需要改動共享狀態時，才導入 mutable borrow 或同步原語。'
    ]
  },
  {
    id: 'docker-multistage',
    title: '用 multi-stage build 大幅縮小 Docker image 體積',
    theme: { slug: 'devops', name: 'DevOps' },
    tags: [
      { slug: 'docker', name: 'Docker' },
      { slug: 'devops', name: 'DevOps' }
    ],
    date: '4 月 12 日',
    read: '8 分鐘',
    url: '/post/devops/docker-multistage/',
    excerpt: '多階段建構不只能降低 image 大小，還能讓 build 邏輯更清晰。本篇介紹最佳實踐與常見陷阱。',
    paragraphs: [
      'Multi-stage build 的核心是把編譯環境與執行環境拆開。第一階段負責安裝工具、編譯產物；最後階段只複製執行需要的檔案。',
      '這種做法能減少攻擊面、縮短部署傳輸時間，也能讓 Dockerfile 的意圖更容易被審查。',
      '常見陷阱是把 package manager cache、測試資料或 build secret 留在最後 image。每次 COPY 都應該問自己：這個檔案真的需要出現在 production 嗎？'
    ]
  },
  {
    id: 'ebpf-tracing',
    title: 'eBPF：在不修改 kernel 的情況下追蹤系統行為',
    theme: { slug: 'performance', name: '效能觀測' },
    tags: [
      { slug: 'linux', name: 'Linux' },
      { slug: 'performance', name: '效能' }
    ],
    date: '4 月 5 日',
    read: '15 分鐘',
    url: '/post/performance/ebpf-tracing/',
    excerpt: 'eBPF 讓你能在生產環境中進行高效能的觀測與除錯，而無需修改核心原始碼或重啟服務。',
    paragraphs: [
      'eBPF 讓小型程式能安全地掛載到 kernel 事件上，例如 syscall、network packet 或 tracepoint。',
      '它的威力在於可以在不中斷服務的情況下取得系統行為訊號，特別適合分析 latency、封包路徑與資源瓶頸。',
      '使用時要注意觀測成本。再輕量的 tracing 都不是免費的，應該先明確定義問題，再選擇最窄的 hook 點。'
    ]
  },
  {
    id: 'go-channel-patterns',
    title: 'Go channel 設計模式：從 fan-out 到 pipeline',
    theme: { slug: 'concurrency', name: '並發模型' },
    tags: [
      { slug: 'go', name: 'Go' },
      { slug: 'concurrency', name: '並發' }
    ],
    date: '3 月 28 日',
    read: '10 分鐘',
    url: '/post/concurrency/go-channel-patterns/',
    excerpt: 'Channel 不只是傳遞資料的管道，它是 Go 並發模型的核心抽象。透過幾個實際模式掌握其用法。',
    paragraphs: [
      'Channel 適合用來表達工作流邊界：誰產生資料、誰消費資料、何時停止。',
      'Fan-out 可以把工作分配給多個 worker；pipeline 則適合把資料處理拆成可組合的階段。',
      '真正困難的不是建立 channel，而是定義關閉責任。通常由 sender 關閉 channel，並透過 context 傳遞取消訊號。'
    ]
  },
  {
    id: 'wasm-2025',
    title: 'WebAssembly 在 2025 年的現狀：從瀏覽器到邊緣運算',
    theme: { slug: 'frontend', name: '前端與邊緣' },
    tags: [
      { slug: 'webassembly', name: 'WebAssembly' },
      { slug: 'frontend', name: '前端' }
    ],
    date: 'Mar 20',
    read: '9 min',
    url: '/post/frontend/wasm-2025/',
    excerpt: '整理 WebAssembly 在瀏覽器、伺服器與邊緣運算中的角色變化，以及它適合解決的問題類型。',
    paragraphs: [
      'WebAssembly 從瀏覽器效能工具，逐漸變成跨平台 sandbox 執行格式。',
      '它適合把特定計算核心移植到不同環境，但不一定適合取代一般應用程式框架。',
      '評估 WASM 時，應該同時看啟動成本、語言工具鏈、debug 體驗與部署平台支援。'
    ]
  },
  {
    id: 'postgres-explain-analyze',
    title: 'PostgreSQL EXPLAIN ANALYZE 完全指南：讀懂查詢計畫',
    theme: { slug: 'database', name: '資料庫' },
    tags: [
      { slug: 'postgresql', name: 'PostgreSQL' },
      { slug: 'database', name: '資料庫' }
    ],
    date: 'Mar 14',
    read: '14 min',
    url: '/post/database/postgres-explain-analyze/',
    excerpt: '查詢計畫不是資料庫黑盒輸出的神諭，而是理解索引、join strategy 與資料分布的觀測工具。',
    paragraphs: [
      'EXPLAIN ANALYZE 會實際執行查詢並回報每個節點的估計與實際成本。',
      '讀計畫時先看資料量是否估錯，再看最昂貴的節點是否可以透過索引、條件重寫或統計資訊改善。',
      '不要只追求某個單一查詢變快，也要評估索引對寫入成本、磁碟空間與維護工作的影響。'
    ]
  },
  {
    id: 'nix-flakes',
    title: '用 Nix Flakes 打造可重現的開發環境',
    theme: { slug: 'tooling', name: '工具鏈' },
    tags: [
      { slug: 'nix', name: 'Nix' },
      { slug: 'tooling', name: '工具鏈' }
    ],
    date: 'Mar 7',
    read: '11 min',
    url: '/post/tooling/nix-flakes/',
    excerpt: '用 Nix Flakes 固定工具版本與開發環境，降低新人 setup 成本，也讓 CI 與本機更接近。',
    paragraphs: [
      'Nix Flakes 把輸入版本鎖定下來，讓同一份環境定義可以在不同機器重現。',
      '它特別適合多語言專案，因為你可以同時描述 Node、Python、系統套件與 shell 工具。',
      '導入時建議先從 dev shell 開始，不要一口氣把整個 build pipeline 都搬進 Nix。'
    ]
  },
  {
    id: 'typescript-advanced-types',
    title: 'TypeScript 5.x 實用進階型別技巧整理',
    theme: { slug: 'frontend', name: '前端與邊緣' },
    tags: [
      { slug: 'typescript', name: 'TypeScript' },
      { slug: 'frontend', name: '前端' }
    ],
    date: 'Feb 22',
    read: '7 min',
    url: '/post/frontend/typescript-advanced-types/',
    excerpt: '整理條件型別、映射型別與 satisfies 的常見用法，讓型別系統幫你守住資料形狀。',
    paragraphs: [
      '進階型別最有價值的地方，是把重複的資料約束變成可推導的型別規則。',
      '條件型別適合描述分支，映射型別適合批次轉換物件欄位，satisfies 則能在保留推論的同時檢查契約。',
      '型別技巧不應該變成猜謎。當型別定義比業務邏輯還難讀時，通常代表抽象需要收斂。'
    ]
  },
  {
    id: 'linux-io-model',
    title: '深度解析 Linux I/O 模型：從阻塞到 io_uring',
    theme: { slug: 'system-programming', name: '系統程式' },
    tags: [
      { slug: 'linux', name: 'Linux' },
      { slug: 'system-programming', name: '系統程式' }
    ],
    date: 'Feb 10',
    read: '18 min',
    url: '/post/system-programming/linux-io-model/',
    excerpt: '從 blocking I/O、non-blocking I/O、epoll 到 io_uring，理解 Linux I/O 模型的演進脈絡。',
    paragraphs: [
      'Linux I/O 模型的演進，可以看成應用程式如何更有效率地等待外部事件。',
      'epoll 解決了大量 fd 的 readiness notification；io_uring 則進一步把提交與完成佇列變成共享資料結構。',
      '選擇模型時不要只看理論吞吐量，也要看程式複雜度、kernel 版本、框架支援與團隊除錯能力。'
    ]
  }
];
