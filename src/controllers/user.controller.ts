import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";

export class UserController {
  static async getAllUsers(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UserService.getAllUsers();
      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const user = await UserService.getUserById(id);
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.createUser(req.body);
      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const user = await UserService.updateUser(id, req.body);
      res.json({
        success: true,
        message: "User updated successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await UserService.deleteUser(id);
      res.json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
