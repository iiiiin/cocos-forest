// api/forest.ts
import apiClient from "../../shared/api/axios";
import { request } from "../../shared/api/request";
import type { ForestInfoDto } from "./types";

export type PointsDto = number; // 숫자가 바로 반환됨

/* 내 숲 정보 조회 */
export async function fetchForestInfo(): Promise<ForestInfoDto> {
  return request(apiClient.get("/api/forest"), "숲 정보 조회에 실패했습니다.");
}

/* 내 포인트 조회 */
export async function fetchPoints(): Promise<PointsDto> {
  return request(apiClient.get("/api/forest/points"), "포인트 조회에 실패했습니다.");
}

/* 나무 심기 */
export async function plantTree(x: number, y: number, assetId: number = 1): Promise<void> {
  await request(apiClient.post("/api/forest/assets/plants", { x, y, assetId }), "나무 심기에 실패했습니다.");
}

/* 물주기 */
export async function waterTree(treeId: number): Promise<void> {
  await request(apiClient.post(`/api/forest/assets/plants/${treeId}/water`), "물주기에 실패했습니다.");
}

/* 죽은 나무 제거 */
export async function removeDeadTree(treeId: number): Promise<void> {
  await request(apiClient.delete(`/api/forest/assets/plants/${treeId}`), "죽은 나무 제거에 실패했습니다.");
}

/* 숲 확장 (1000 포인트 소모) */
export async function expandForest(): Promise<ForestInfoDto> {
  return request(apiClient.post("/api/forest/expand"), "숲 확장에 실패했습니다.");
}

/* 장식(Decoration) 배치 */
export async function placeDecoration(x: number, y: number, assetId: number): Promise<void> {
  await request(apiClient.post("/api/forest/assets/decorations", { x, y, assetId }), "장식 배치에 실패했습니다.");
}

/* 장식(Decoration) 삭제 */
export async function removeDecoration(decorationId: number): Promise<void> {
  await request(apiClient.delete(`/api/forest/assets/decorations/${decorationId}`), "장식 제거에 실패했습니다.");
}

// ========= Asset Catalog =========
export type AssetType = "tree" | "decoration";

export interface AssetDto {
  id: number;
  name: string;
  categoryId: number;
  categoryCode?: string | null;
  categoryName?: string | null;
  pricePoints?: number | null;
  spriteKey?: string | null;
  active?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

export async function listAssets(type?: AssetType, categoryId?: number): Promise<AssetDto[]> {
  const params = categoryId ? { params: { categoryId } } : undefined;

  if (!type) {
    const [plants, decorations] = await Promise.all([
      request<AssetDto[]>(apiClient.get("/api/forest/assets/plants", params), "자산 목록을 불러오는데 실패했습니다."),
      request<AssetDto[]>(apiClient.get("/api/forest/assets/decorations", params), "자산 목록을 불러오는데 실패했습니다."),
    ]);
    return [...plants, ...decorations];
  }

  const url = type === "tree" ? "/api/forest/assets/plants" : "/api/forest/assets/decorations";
  return request<AssetDto[]>(apiClient.get(url, params), "자산 목록을 불러오는데 실패했습니다.");
}
