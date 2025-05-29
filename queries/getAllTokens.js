import { gql } from '@apollo/client'

export default gql`
subscription Tokens($first: Int, $offset: Int) {
    queryTokens(first: $first, offset: $offset, filter: {isactive: true, iskitsu: false, ispayment: true}) {
        name
        asset_id
        image
        unitname
        decimal
        rate
        isactive
        ispayment
    }
}`