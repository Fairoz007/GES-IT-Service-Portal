/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as assets from "../assets.js";
import type * as aup from "../aup.js";
import type * as credentials from "../credentials.js";
import type * as maintenance from "../maintenance.js";
import type * as network from "../network.js";
import type * as notifications from "../notifications.js";
import type * as procurement from "../procurement.js";
import type * as shares from "../shares.js";
import type * as stats from "../stats.js";
import type * as tickets from "../tickets.js";
import type * as users from "../users.js";
import type * as website from "../website.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  assets: typeof assets;
  aup: typeof aup;
  credentials: typeof credentials;
  maintenance: typeof maintenance;
  network: typeof network;
  notifications: typeof notifications;
  procurement: typeof procurement;
  shares: typeof shares;
  stats: typeof stats;
  tickets: typeof tickets;
  users: typeof users;
  website: typeof website;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
