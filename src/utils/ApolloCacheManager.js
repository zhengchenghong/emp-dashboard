export function update(cache, { data: { updateGrouping } }) {
  cache.modify({
    fields: {
      grouping(allGrouping = [], details) {
        const updatedGrouping = allGrouping.map((group) => {
          if (group._id === updateGrouping?._id) {
            let tmp = JSON.parse(JSON.stringify(updateGrouping));
            return tmp;
          }
          return group;
        });
        return updatedGrouping;
      }
    }
  });
}

export function updateAll(cache, grouping) {
  cache.modify({
    fields: {
      grouping(allGrouping = []) {
        const updatedGrouping = allGrouping?.map((group) => {
          let updateItem = grouping?.find((el) => el?._id === group?._id);
          if (updateItem) {
            return updateItem;
          } else {
            return group;
          }
        });
        return updatedGrouping;
      }
    }
  });
}

export function remove(cache, { data: { deleteDocument } }, id) {
  cache.modify({
    fields: {
      grouping(allGrouping = []) {
        const updatedGrouping = allGrouping.filter((el) => el._id !== id);
        return updatedGrouping;
      }
    }
  });
}

export function create(cache, { data: { createGrouping } }) {
  cache.modify({
    fields: {
      grouping(allGrouping = [], details) {
        console.log(details);
        const schemaType = JSON.parse(
          details.storeFieldName.replace('grouping(', '').replace(')', '')
        )?.schemaType;
        if (createGrouping.schemaType === schemaType) {
          const exists = allGrouping
            .map((item) => item._id)
            .includes(createGrouping?._id);
          if (exists) return allGrouping;
          else return [createGrouping, ...allGrouping];
        } else if (
          allGrouping.length &&
          allGrouping[0].schemaType === createGrouping.schemaType
        ) {
          const exists = allGrouping
            .map((item) => item._id)
            .includes(createGrouping?._id);
          if (exists) return allGrouping;
          else return [createGrouping, ...allGrouping];
        } else {
          return allGrouping;
        }
      },
      allStations(allStations = [], details) {
        if (createGrouping.schemaType === 'station') {
          const exists = allStations
            ?.map((item) => item._id)
            .includes(createGrouping?._id);
          if (!exists) {
            return [createGrouping, ...allStations];
          }
          return allStations;
        }
      }
    }
  });
}

export function upsertMMA(cache, { data: { upsertMMA } }) {
  cache.modify({
    fields: {
      grouping(allGrouping = []) {
        const updatedGrouping = allGrouping.map((group) => {
          if (group?._id === upsertMMA?._id) {
            let tmp = upsertMMA;
            return tmp;
          }
          return group;
        });
        return updatedGrouping;
      }
    }
  });
}

export function deleteMMA(cache, { data: { deleteMMA } }) {
  cache.modify({
    fields: {
      grouping(allGrouping = []) {
        const updatedGrouping = allGrouping.map((group) => {
          if (group?._id === deleteMMA?._id) {
            let tmp = deleteMMA;
            return tmp;
          }
          return group;
        });
        return updatedGrouping;
      }
    }
  });
}

export function moveToNewParent(cache, { data: { movetoNewParent } }) {
  cache.modify({
    fields: {
      grouping(allGrouping = []) {
        const updatedGrouping = allGrouping.map((group) => {
          if (group?._id === movetoNewParent?.doc?._id) {
            let tmp = movetoNewParent.doc;
            return tmp;
          }

          if (group?._id === movetoNewParent?.oldParent?._id) {
            let tmp = movetoNewParent.oldParent;
            return tmp;
          }

          if (group?._id === movetoNewParent?.newParent?._id) {
            let tmp = movetoNewParent.newParent;
            return tmp;
          }

          return group;
        });
        return updatedGrouping;
      }
    }
  });
}

export function updateSubscription(cache, data) {
  cache.modify({
    fields: {
      grouping(allGrouping = []) {
        const updatedGrouping = allGrouping.map((group) => {
          if (group?._id === data?._id) {
            let tmp = data;
            return tmp;
          }
          return group;
        });
        return updatedGrouping;
      }
    }
  });
}

export function createSubscription(cache, data) {
  cache.modify({
    fields: {
      grouping(allGrouping = [], details) {
        console.log(details);
        const schemaType = JSON.parse(
          details.storeFieldName.replace('grouping(', '').replace(')', '')
        )?.schemaType;
        if (data.schemaType === schemaType) {
          const exists = allGrouping
            .map((item) => item._id)
            .includes(data?._id);
          if (exists) return allGrouping;
          else return [data, ...allGrouping];
        } else {
          return allGrouping;
        }
      }
    }
  });
}

export function deleteSubscription(cache, data) {
  cache.modify({
    fields: {
      grouping(allGrouping = []) {
        const updatedGrouping = allGrouping.filter(
          (el) => el._id !== data?._id
        );
        return updatedGrouping;
      }
    }
  });
}

export function preUpdateReOrder(cache, variables) {
  cache.modify({
    fields: {
      grouping(allGrouping = []) {
        const updatedGrouping = allGrouping.map((group) => {
          if (group._id === variables?.id) {
            let value = JSON.parse(JSON.stringify(group));
            delete value.__typename;
            value.rank = variables?.rank;
            return value;
            // return { ...group, rank: variables?.rank };
          }
          return group;
        });
        return updatedGrouping;
      }
    }
  });
}

export function groupingList(cache, { data: { updateGroupingList } }) {
  cache.modify({
    fields: {
      grouping(allGrouping = []) {
        const updatedGrouping = allGrouping.map((group) => {
          if (group._id === updateGroupingList?._id) {
            let tmp = updateGroupingList;
            return tmp;
          }
          return group;
        });
        return updatedGrouping;
      }
    }
  });
}

export function archivedClass(cache, { data: { archiveClass } }) {
  console.log('archiveClass', archiveClass);
  cache.modify({
    fields: {
      grouping(allGrouping = []) {
        const updatedGrouping = allGrouping.filter(
          (el) => el._id !== archiveClass
        );
        return updatedGrouping;
      }
    }
  });
}
