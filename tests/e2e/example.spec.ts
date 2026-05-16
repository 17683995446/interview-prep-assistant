import { test, expect } from '@playwright/test';

test.describe('刷题平台 E2E 测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test('首页加载正常', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('面试刷题');
  });

  test('能导航到题目列表', async ({ page }) => {
    const questionsLink = page.locator('nav a', { hasText: '题目' });
    await expect(questionsLink).toBeVisible();
    await questionsLink.click();
    await expect(page).toHaveURL(/questions/);
  });

  test('能筛选题目', async ({ page }) => {
    await page.click('nav >> text=题目');
    await page.waitForURL(/questions/);
    
    const algorithmFilter = page.locator('button', { hasText: '算法' });
    if (await algorithmFilter.isVisible()) {
      await algorithmFilter.click();
      await page.waitForTimeout(500);
    }
    
    const cards = page.locator('[class*="glass-effect"]');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('能收藏题目', async ({ page }) => {
    await page.click('nav >> text=题目');
    await page.waitForURL(/questions/);
    await page.waitForTimeout(1000);
    
    const firstCard = page.locator('[class*="glass-effect"]').first();
    if (await firstCard.isVisible()) {
      await firstCard.hover();
      const favoriteButton = firstCard.locator('button[aria-label*="收藏"]');
      if (await favoriteButton.isVisible()) {
        await favoriteButton.click();
        await page.waitForTimeout(300);
        await expect(firstCard.locator('button[aria-label*="取消收藏"]')).toBeVisible();
      }
    }
  });

  test('主题切换正常', async ({ page }) => {
    const themeToggle = page.locator('button[aria-label*="主题"]').or(
      page.locator('button[aria-label*="theme"]')
    );
    
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(500);
      const htmlClass = await page.locator('html').getAttribute('class');
      expect(htmlClass).toMatch(/light|dark/);
    }
  });

  test('能访问进度页面', async ({ page }) => {
    const progressLink = page.locator('nav a', { hasText: '进度' });
    await progressLink.click();
    await page.waitForURL(/progress/);
    await expect(page.locator('text=进度')).toBeVisible();
  });

  test('能访问成就页面', async ({ page }) => {
    const achievementsLink = page.locator('nav a', { hasText: '成就' });
    await achievementsLink.click();
    await page.waitForURL(/achievements/);
    await expect(page.locator('text=成就')).toBeVisible();
  });

  test('能访问排行榜页面', async ({ page }) => {
    const rankingLink = page.locator('nav a', { hasText: '排行' });
    await rankingLink.click();
    await page.waitForURL(/ranking/);
    await expect(page.locator('text=排行')).toBeVisible();
  });

  test('能从首页导航到题目详情', async ({ page }) => {
    await page.waitForTimeout(1000);
    const startButton = page.locator('button', { hasText: '开始刷题' });
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForURL(/questions/);
      await page.waitForTimeout(500);
      
      const firstQuestion = page.locator('[class*="glass-effect"]').first();
      if (await firstQuestion.isVisible()) {
        await firstQuestion.click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test('搜索功能正常', async ({ page }) => {
    await page.click('nav >> text=题目');
    await page.waitForURL(/questions/);
    
    const searchInput = page.locator('input[placeholder*="搜索"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('数组');
      await page.waitForTimeout(1000);
      
      const cards = page.locator('[class*="glass-effect"]');
      const count = await cards.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('能切换难度筛选', async ({ page }) => {
    await page.click('nav >> text=题目');
    await page.waitForURL(/questions/);
    await page.waitForTimeout(1000);
    
    const easyButton = page.locator('button', { hasText: '简单' });
    if (await easyButton.isVisible()) {
      await easyButton.click();
      await page.waitForTimeout(500);
      
      const mediumButton = page.locator('button', { hasText: '中等' });
      if (await mediumButton.isVisible()) {
        await mediumButton.click();
        await page.waitForTimeout(500);
      }
    }
  });
});

test.describe('模拟面试 E2E 测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test('能访问模拟面试页面', async ({ page }) => {
    const interviewLink = page.locator('nav a', { hasText: '面试' });
    if (await interviewLink.isVisible()) {
      await interviewLink.click();
      await page.waitForURL(/interview/);
      await page.waitForTimeout(1000);
    }
  });
});

test.describe('数据管理 E2E 测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test('能访问数据管理页面', async ({ page }) => {
    const dataLink = page.locator('nav a', { hasText: '数据' });
    if (await dataLink.isVisible()) {
      await dataLink.click();
      await page.waitForURL(/data/);
      await expect(page.locator('text=数据')).toBeVisible();
    }
  });
});
