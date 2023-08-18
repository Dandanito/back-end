const DiscountType = {
    None: 1,
    Percentage: 2,
    Amount: 3
} as const;

const ProductGroup = {
    Orthodontic: 1,
    Prosthesis: 2,
    Surgery: 3,
    Repair: 4,
    Periodontal: 5,
    OralDiseases: 6
} as const

export { DiscountType, ProductGroup };