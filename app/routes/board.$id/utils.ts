import { type Company } from "../../fake-data";

/**
 * グループ化された企業のオブジェクトを作成する
 * @param companies - グループ化する企業のリスト
 * @param field - グループ化の基準となる企業のフィールド
 * @returns - グループ化された企業のオブジェクト
 */
export function groupCompanies(companies: Company[], field: keyof Company) {
  const groups = companies.reduce(
    (acc, company) => {
      const key = company[field]; // status
      const current = acc[key] || []; // statusに紐づく現在のリスト
      return { ...acc, [key]: [...current, company] };
    },
    {} as Record<string, Company[]>,
  );
  for (const key in groups) {
    groups[key].sort((a, b) => a.order - b.order);
  }
  return groups;
}

/**
 * 指定された順序に基づいて文字列をソートするための比較関数を
 * @param order - ソートの順序を指定する文字列の配列
 * @returns - 文字列を比較するための関数
 */
export function sortByStatusOrder(order: string[]) {
  return (a: string, b: string) => {
    let indexA = order.indexOf(a);
    let indexB = order.indexOf(b);
    // console.log(`${a}の位置は ${indexA}, ${b}の位置は ${indexB}`);

    // If a is not in order array, set its index to be larger than the length of the order array
    if (indexA === -1) indexA = order.length;

    // If b is not in order array, set its index to be larger than the length of the order array
    if (indexB === -1) indexB = order.length;

    return indexA - indexB;
  };
}
