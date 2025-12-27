import { ApiError, ApiSuccess } from '../utils/apiError.js';
import { db } from '../libs/db.ts';

const createPlayList = async (req, res, next) => {
  const { name, description } = req.body;
  const userId = req.user.id;
  try {
    const playlist = await db.playlist.create({
      data: {
        name,
        description,
        userId,
      },
    });

    res.status(200).json(new ApiSuccess(200, 'Playlist created', playlist));
  } catch (error) {
    console.error('Error creating playlist:', error);
    next(new ApiError(500, 'Error creating playlist', error));
  }
};

const getAllListDetails = async (req, res, next) => {
  try {
    const playlists = await db.playlist.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        problems: {
          include: {
            problem: true,
          },
        },
      },
    });

    res
      .status(200)
      .json(new ApiSuccess(200, 'Playlists fetched successfully', playlists));
  } catch (error) {
    console.error('Error fetching playlists:', error);
    next(new ApiError(500, 'Error fetching playlists', error));
  }
};

const getPlayListDetails = async (req, res, next) => {
  const { playlistId } = req.params;
  try {
    const playlist = await db.playlist.findMany({
      where: {
        id: playlistId,
        userId: req.user.id,
      },
      include: {
        problems: {
          include: {
            problem: true,
          },
        },
      },
    });

    if (!playlist) {
      return next(new ApiError(404, 'Playlist not found'));
    }

    res
      .status(200)
      .json(
        new ApiSuccess(200, 'playlist details fetched successfully', playlist)
      );
  } catch (error) {
    console.error('Error fetching playlist details:', error);
    next(new ApiError(500, 'Error fetching playlist details', error));
  }
};

const addProblemToPlaylist = async (req, res, next) => {
  const { playlistId } = req.params;
  const { problemIds } = req.body;

  try {
    if (!Array.isArray(problemIds) || problemIds.length === 0) {
      return next(new ApiError(404, 'Invalid or missing problems'));
    }

    const problemsInPlaylist = await db.problemInPlaylist.createMany({
      data: problemIds.map((problemId) => ({
        playListId: playlistId,
        problemId: problemId,
      })),
    });

    res
      .status(201)
      .json(
        new ApiSuccess(
          201,
          'problem added to playlist successfully',
          problemsInPlaylist
        )
      );
  } catch (error) {
    console.error('Error adding problem to playlist details:', error);
    next(new ApiError(500, 'Error adding problem to playlist details', error));
  }
};

const deletePlayList = async (req, res, next) => {
  const { playlistId } = req.params;
  try {
    const deletePlayList = await db.playlist.delete({
      where: {
        id: playlistId,
      },
    });

    res
      .status(200)
      .json(
        new ApiSuccess(200, 'playlist deleted successfully', deletePlayList)
      );
  } catch (error) {
    console.error('Error deleting playlist:', error);
    next(new ApiError(500, 'Error deleting playlist', error));
  }
};

const removeProblemFromPlaylist = async (req, res, next) => {
  const { playlistId } = req.params;
  const { problemIds } = req.body;
  try {
    if (!Array.isArray(problemIds) || problemIds.length === 0) {
      return next(new ApiError(404, 'Invalid or missing problems'));
    }

    const deletedProblem = await db.problemInPlaylist.deleteMany({
      where: {
        playListId: playlistId,
        problemId: {
          in: problemIds,
        },
      },
    });

    res
      .status(200)
      .json(
        new ApiSuccess(
          200,
          'problem deleted from playlist successfully',
          deletedProblem
        )
      );
  } catch (error) {
    console.error('Error deleting problem from playlist:', error);
    next(new ApiError(500, 'Error deleting problem from playlist', error));
  }
};

export {
  createPlayList,
  getAllListDetails,
  getPlayListDetails,
  addProblemToPlaylist,
  deletePlayList,
  removeProblemFromPlaylist,
};
