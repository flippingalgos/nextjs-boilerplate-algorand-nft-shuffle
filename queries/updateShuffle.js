import { gql } from '@apollo/client'

const UPDATE_SHUFFLE = gql`
  mutation updateShuffle($asset_id: Int64) {
    updateShuffle(input: {filter: {asset_id: {eq: $asset_id}}, set: {claimed: true}}) {
        numUids
    }
  }
`;

export { UPDATE_SHUFFLE };