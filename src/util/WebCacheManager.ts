import { container } from "@sapphire/framework";
import { Time } from "@sapphire/time-utilities";

interface WebCache {}

interface TeamMember {
  username: string;
  color: string;
  avatar: string;
  role: string;
}

interface SellixResponse {
  status: number;
  data: { products: SellixProduct[] };
}

interface SellixImageAttachment {
  id: number;
  name: string;
  type: "IMAGE";
  uniqid: string;
  shop_id: number;
  storage: "PRODUCTS";
  extension: "png" | "jpg" | "jpeg" | "gif";
  created_at: number;
  product_id: number;
  original_name: string;
  cloudflare_image_id: string;
}

interface SellixFeedback {
  total: number;
  positive: number;
  neutral: number;
  negative: number;
  numbers: any[];
  list: any[];
}

interface SellixProduct {
  id: number;
  uniqid: string;
  slug: string;
  shop_id: number;
  type: "SUBSCRIPTION" | "SERVICE";
  subtype?: string;
  title: string;
  currency: "USD";
  pay_what_you_want: boolean;
  price: number;
  price_display: number;
  price_discount: number;
  affiliate_revenue_percent: number;
  price_variants?: any;
  description: string;
  licensing_enabled: boolean;
  license_period?: number;
  image_attachment?: SellixImageAttachment;
  file_attachment?: any[];
  youtube_link?: string;
  volume_discounts: any[];
  recurring_interval?: string;
  recurring_interval_count?: number;
  trial_period?: number;
  paypal_product_id?: string;
  paypal_plan_id?: string;
  stripe_price_id?: string;
  discord_integration: boolean;
  discord_optional?: boolean;
  discord_set_role?: boolean;
  discord_server_id?: string;
  discord_role_id?: string;
  discord_remove_role?: boolean;
  quantity_min: number;
  quantity_max: number;
  quantity_warning: number;
  gateways: string[];
  custom_fields: any[];
  crypto_confirmations_needed: number;
  max_risk_level: number;
  block_vpn_proxies: boolean;
  delivery_text: string;
  delivery_time?: string;
  service_text: string;
  stock_delimiter: string;
  stock: number;
  dynamic_webhook: string;
  bestseller: boolean;
  sort_priority: number;
  unlisted: boolean;
  on_hold: boolean;
  terms_of_service: string;
  warranty: boolean;
  warranty_text: string;
  watermark_enabled: boolean;
  watermark_text: string;
  redirect_link?: string;
  label_singular?: string;
  label_plural?: string;
  private: boolean;
  created_at: number;
  updated_at: number;
  updated_by: number;
  marketplace_category_id: number;
  telegram_group_id: string;
  telegram_integration: boolean;
  telegram_optional: boolean;
  image_name: string;
  image_storage: "PRODUCTS";
  cloudflare_image_id: string;
  image_attachments: SellixImageAttachment[];
  feedback: SellixFeedback;
  categories: any[];
  payment_gateway_fees: any[];
}

interface SellixProductMinimal {
  url: string;
  image_url?: string;
  title: string;
  description: string;
  price: number;
  visible: boolean;
}

interface DvSCache {
  team: TeamMember[];
  shopProducts: SellixProductMinimal[];
}

export default class WebCacheManager {
  public cache: DvSCache = {
    team: [],
    shopProducts: [],
  };

  public constructor() {
    this.updateCache();
    setInterval(() => this.updateCache(), Time.Minute * 15);
  }

  private async updateCache() {
    this.cache.team = await this.fetchTeamMembers();
    this.cache.shopProducts = await this.fetchShopProducts();

    container.logger.info("WebCacheManager: Updated cache");
  }

  private async fetchTeamMembers(): Promise<TeamMember[]> {
    const guild = container.client.guilds.cache.first();
    await guild?.members.fetch();
    const role = guild?.roles.cache.get(process.env.SUPPORT_ROLE_ID!);

    if (!role) {
      throw new Error("Support role not found");
    }

    const members = role.members.map((member) => {
      return {
        username: member.user.username,
        color: member.displayHexColor,
        avatar: member.user.displayAvatarURL({ size: 512 }),
        role: member.roles.highest.name
          .replace(
            /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2B50}\u{2B55}]/gu,
            ""
          )
          .trim(),
      };
    });

    return members;
  }

  private async fetchShopProducts(): Promise<SellixProductMinimal[]> {
    const response = await fetch("https://dev.sellix.io/v1/products", {
      headers: {
        Authorization: `Bearer ${process.env.SELLIX_API_KEY}`,
      },
    });

    const data: SellixResponse = await response.json();

    return data.data.products.map((product) => {
      return {
        url: `https://${process.env.SELLIX_DOMAIN}/product/${product.slug}`,
        image_url: product.image_attachments[0]
          ? `https://cdn.sellix.io/product/${product.image_attachments[0].cloudflare_image_id}`
          : undefined,
        title: product.title,
        description: product.description,
        price: product.price,
        visible: !product.unlisted,
      };
    });
  }
}
