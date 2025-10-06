import ApiService from './ApiService'

export interface MenuItem {
  id: number
  title: string
  url: string
  level: number
  page: any
  specialty: any
  children: MenuItem[]
  page_id?: number | null
  menu_id?: number
  parent_id?: number | null
  slug?: string
  specialty_id?: number | null
  target?: string
  icon_class?: string | null
  display_order?: number
  is_active?: boolean
  status?: boolean
  created_at?: string
  updated_at?: string
}

export interface NavigationMenu {
  id: number
  name: string
  location: string
  is_active: boolean
  items: MenuItem[]
}

export interface NavigationResponse {
  status: number
  message: string
  data: NavigationMenu[]
}

export interface MenuItemResponse {
  status: number
  message: string
  data: MenuItem
}

export interface CreateMenuPayload {
  menu_id?: number
  parent_id: number | null
  title: string
  url: string
  [key: string]: unknown
}

class NavigationService {
  /**
   * Get all navigation menus
   */
  async getNavigationMenus(): Promise<NavigationResponse> {
    const response = await ApiService.fetchData<NavigationResponse>({
      url: '/navigation/admin/menu',
      method: 'GET',
    })
    return response.data
  }

  /**
   * Get main header menu items
   */
  async getMainHeaderMenu(): Promise<NavigationResponse> {
    const response = await this.getNavigationMenus()
    const mainHeaderMenu = response.data.find(menu => menu.location === 'header')
    
    if (!mainHeaderMenu) {
      throw new Error('Main header menu not found')
    }
    
    return {
      ...response,
      data: [mainHeaderMenu]
    }
  }

  /**
   * Get sidebar menu items
   */
  async getSidebarMenu(): Promise<NavigationResponse> {
    const response = await ApiService.fetchData<NavigationResponse>({
      url: '/navigation/admin/sidebar/menu',
      method: 'GET',
    })
    return response.data
  }

  /**
   * Get menu item by ID
   */
  async getMenuItemById(menuId: number): Promise<MenuItemResponse> {
    const response = await ApiService.fetchData<MenuItemResponse>({
      url: `/navigation/admin/menu/${menuId}`,
      method: 'GET',
    })
    return response.data
  }

  /**
   * Get children menu items by parent menu ID
   */
  async getChildrenMenu(menuId: number): Promise<MenuItemResponse> {
    const response = await ApiService.fetchData<MenuItemResponse>({
      url: `/navigation/admin/menu/${menuId}`,
      method: 'GET',
    })
    return response.data
  }

  /**
   * Update menu item
   */
  async updateMenuItem(menuId: number, data: Partial<MenuItem>): Promise<MenuItemResponse> {
    const response = await ApiService.fetchData<MenuItemResponse>({
      url: `/navigation/admin/menu/${menuId}`,
      method: 'PUT',
      data,
    })
    return response.data
  }

  /**
   * Create new menu item
   */
  async createMenuItem(data: Partial<MenuItem>): Promise<MenuItemResponse> {
    const response = await ApiService.fetchData<MenuItemResponse>({
      url: '/navigation/admin/menu',
      method: 'POST',
      data,
    })
    return response.data
  }

  /**
   * Create new navigation menu item with specific payload structure
   */
  async createNavigationMenu(data: CreateMenuPayload): Promise<MenuItemResponse> {
    const response = await ApiService.fetchData<MenuItemResponse>({
      url: '/navigation/menu',
      method: 'POST',
      data,
    })
    return response.data
  }

  /**
   * Delete menu item (admin endpoint)
   */
  async deleteMenuItem(menuId: number): Promise<{ status: number; message: string }> {
    const response = await ApiService.fetchData<{ status: number; message: string }>({
      url: `/navigation/admin/menu/${menuId}`,
      method: 'DELETE',
    })
    return response.data
  }

  /**
   * Delete menu item (public endpoint)
   */
  async deleteMenu(menuId: number): Promise<{ status: number; message: string }> {
    const response = await ApiService.fetchData<{ status: number; message: string }>({
      url: `/navigation/menu/${menuId}`,
      method: 'DELETE',
    })
    return response.data
  }
}

export default new NavigationService()
