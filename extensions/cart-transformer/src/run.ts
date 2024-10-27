import type {
  RunInput,
  FunctionRunResult, CartLine,
  CartOperation,
  ProductVariant,
} from "../generated/api";


// gid:\/\/shopify\/ProductVariant\/43919862726832

// gid:\/\/shopify\/ProductVariant\/7617808531632



export function run(input: RunInput): FunctionRunResult {
  const groupedItems: Record<string, Pick<CartLine, "id" | "quantity">[]> = {};

  input.cart.lines.forEach((line) => {
      const bundleId = line.bundleId;
      if(bundleId && bundleId.value) {
        if (!groupedItems[bundleId.value]) {
          groupedItems[bundleId.value] = [];
        }

        groupedItems[bundleId.value].push(line);
      }
  });

//  console.log('yessir we\'re testing right now');

  const itemsWithNoBundleId = input.cart.lines.filter (
    (line) => !!line.bundleId?.value === false
  );
  return {
    operations: [
      ...Object.values(groupedItems).map((group) => {
          const mergeOperation: CartOperation = {
            merge: {
              cartLines: group.map((line) => {
                return {
                  cartLineId: line.id,
                  quantity: line.quantity
                };
              }),
              parentVariantId: "gid:\/\/shopify\/ProductVariant\/43919862726832",
              title: "My Customized Bundle",
              price: {
                percentageDecrease: {
                  value: 10,
                },
              },
            },
          };
          return mergeOperation;
      }),
      ...itemsWithNoBundleId.map(item => {
        const expandOperation: CartOperation = {
          expand: {
            cartLineId: item.id,
            expandedCartItems: [
              {
                merchandiseId: (item.merchandise as ProductVariant).id,
                quantity: item.quantity,
                price: {
                  adjustment: {
                    fixedPricePerUnit: {
                      amount: item.cost.totalAmount.amount
                    }
                  }
                }
              },
              {
                merchandiseId: "gid://shopify/ProductVariant/43597563527344",
                quantity: item.quantity,
                price: {
                  adjustment: {
                    fixedPricePerUnit: {
                      amount: 10,
                    }
                  }
                }
              },
            ],
            title: `${(item.merchandise as ProductVariant).product.title} + Free SD Product`,
          },
        };
         return expandOperation;
      }),
    ],
  };
};