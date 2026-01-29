import type { HttpHandler } from "msw";

/**
 * 模拟接口注册中心
 * 用于支持各模块主动将 mock 处理器注入到主处理器列表中
 */
class MockRegistry {
	private handlers: HttpHandler[] = [];

	/**
	 * 注册 mock 处理器
	 */
	register(...handlers: HttpHandler[]) {
		this.handlers.push(...handlers);
	}

	/**
	 * 获取所有已注册的处理器
	 */
	getHandlers(): HttpHandler[] {
		return [...this.handlers];
	}
}

export const mockRegistry = new MockRegistry();
