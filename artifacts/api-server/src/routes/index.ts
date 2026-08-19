import { Router, type IRouter } from "express";
import healthRouter from "./health";
import projectsRouter from "./projects";
import caseStudiesRouter from "./case-studies";
import galleryRouter from "./gallery";
import blogRouter from "./blog";
import contactRouter from "./contact";
import skillsRouter from "./skills";
import adminRouter from "./admin";
import uploadRouter from "./upload";
import testimonialsRouter from "./testimonials";

const router: IRouter = Router();

router.use(healthRouter);
router.use(projectsRouter);
router.use(caseStudiesRouter);
router.use(galleryRouter);
router.use(blogRouter);
router.use(contactRouter);
router.use(skillsRouter);
router.use(adminRouter);
router.use(uploadRouter);
router.use(testimonialsRouter);

export default router;
