// AI Review按钮的HTML
const AI_REVIEW_BUTTON_HTML = `
  <button id="ai-review-button" class="aui-button">
    <span class="aui-icon aui-icon-small aui-iconfont-approve"></span>
    AI Review
  </button>
`;

// 初始化AI Review功能
function initAIReview() {
  // 检查是否在PR页面
  if (!window.location.pathname.includes('/pull-requests/')) {
    return;
  }

  // 添加AI Review按钮
  const actionsContainer = document.querySelector('.pull-request-actions');
  if (actionsContainer && !document.getElementById('ai-review-button')) {
    actionsContainer.insertAdjacentHTML('beforeend', AI_REVIEW_BUTTON_HTML);
    
    // 添加点击事件
    document.getElementById('ai-review-button').addEventListener('click', handleAIReview);
  }
}

// 处理AI Review请求
async function handleAIReview() {
  try {
    // 显示加载状态
    const button = document.getElementById('ai-review-button');
    button.disabled = true;
    button.textContent = 'AI分析中...';

    // 获取PR的代码变更
    const changes = await extractPRChanges();
    
    // 调用AI进行分析
    const reviewResults = await analyzeCode(changes);
    
    // 显示分析结果
    showReviewResults(reviewResults);
  } catch (error) {
    console.error('AI Review失败:', error);
    alert('AI Review遇到错误，请稍后重试');
  } finally {
    // 恢复按钮状态
    const button = document.getElementById('ai-review-button');
    button.disabled = false;
    button.innerHTML = '<span class="aui-icon aui-icon-small aui-iconfont-approve"></span> AI Review';
  }
}

// 提取PR中的代码变更
async function extractPRChanges() {
  const changes = [];
  const diffContainers = document.querySelectorAll('.diff-container');
  
  diffContainers.forEach(container => {
    const fileName = container.querySelector('.filename').textContent;
    const addedLines = Array.from(container.querySelectorAll('.addition')).map(line => line.textContent);
    const removedLines = Array.from(container.querySelectorAll('.deletion')).map(line => line.textContent);
    
    changes.push({
      fileName,
      additions: addedLines,
      deletions: removedLines
    });
  });
  
  return changes;
}

// 调用AI API进行代码分析
async function analyzeCode(changes) {
  // TODO: 替换为实际的AI API调用
  // 这里可以使用OpenAI API或其他AI服务
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        suggestions: [
          {
            type: 'improvement',
            file: changes[0].fileName,
            line: 10,
            message: '建议添加错误处理',
            severity: 'medium'
          }
          // 更多建议...
        ]
      });
    }, 1000);
  });
}

// 显示AI Review结果
function showReviewResults(results) {
  // 创建结果面板
  const resultsPanel = document.createElement('div');
  resultsPanel.id = 'ai-review-results';
  resultsPanel.className = 'ai-review-panel';
  
  // 添加建议列表
  const suggestionsList = results.suggestions.map(suggestion => `
    <div class="ai-suggestion ${suggestion.severity}">
      <div class="suggestion-header">
        <span class="file-name">${suggestion.file}</span>
        <span class="line-number">行 ${suggestion.line}</span>
      </div>
      <div class="suggestion-content">
        ${suggestion.message}
      </div>
      <div class="suggestion-actions">
        <button class="apply-suggestion">应用</button>
        <button class="ignore-suggestion">忽略</button>
      </div>
    </div>
  `).join('');
  
  resultsPanel.innerHTML = `
    <h3>AI Review 建议</h3>
    <div class="suggestions-list">
      ${suggestionsList}
    </div>
    <div class="panel-actions">
      <button id="apply-all">应用所有选中建议</button>
      <button id="close-panel">关闭</button>
    </div>
  `;
  
  // 添加到页面
  document.body.appendChild(resultsPanel);
  
  // 添加事件处理
  document.getElementById('close-panel').addEventListener('click', () => {
    resultsPanel.remove();
  });
}

// 监听页面变化，确保在PR页面加载完成后初始化
const observer = new MutationObserver(() => {
  initAIReview();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// 初始化
initAIReview();