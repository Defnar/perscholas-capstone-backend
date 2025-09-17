import Task from "../models/Task";

export const updateTaskHistory = async (taskId, userId, action) => {
  await Task.findByIdAndUpdate(taskId, {
    
    $push: {
      $updatedHistory: {
        user: userId,
        action: action,
        time: Date.now()
      },
    },
  });
};
