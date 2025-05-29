import { gql } from '@apollo/client'

export default gql`
subscription queryShuffle {
    aggregateShuffle(filter: {claimed: false}) {
        count
    }
}`