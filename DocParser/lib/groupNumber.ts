import {seq} from '../db';

export default async (groupName) => {
    const [groupNumber] = await seq.query(`SELECT group_number FROM pbm.groups_mapping WHERE group_name = '${groupName}'`) as Array<{group_number}>;
    return groupNumber[0] ? groupNumber[0].group_number : 'Not found';
}