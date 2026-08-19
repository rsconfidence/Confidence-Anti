import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";

import Home from "@/pages/home";
import About from "@/pages/about";
import Projects from "@/pages/projects";
import ProjectDetail from "@/pages/project-detail";
import CaseStudies from "@/pages/case-studies";
import CaseStudyDetail from "@/pages/case-study-detail";
import Gallery from "@/pages/gallery";
import Blog from "@/pages/blog";
import BlogPost from "@/pages/blog-post";
import Resume from "@/pages/resume";
import Contact from "@/pages/contact";
import NotFound from "@/pages/not-found";

// Admin pages (unlisted — no nav links)
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminMessages from "@/pages/admin/messages";
import AdminProjects from "@/pages/admin/projects";
import AdminBlog from "@/pages/admin/blog";
import AdminGallery from "@/pages/admin/gallery";
import AdminSubscribers from "@/pages/admin/subscribers";
import AdminTestimonials from "@/pages/admin/testimonials";
import AdminSettings from "@/pages/admin/settings";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      {/* Admin routes (no public layout) */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/messages" component={AdminMessages} />
      <Route path="/admin/projects" component={AdminProjects} />
      <Route path="/admin/blog" component={AdminBlog} />
      <Route path="/admin/gallery" component={AdminGallery} />
      <Route path="/admin/subscribers" component={AdminSubscribers} />
      <Route path="/admin/testimonials" component={AdminTestimonials} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin" component={AdminDashboard} />

      {/* Public routes */}
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/about" component={About} />
            <Route path="/projects" component={Projects} />
            <Route path="/projects/:slug" component={ProjectDetail} />
            <Route path="/case-studies" component={CaseStudies} />
            <Route path="/case-studies/:slug" component={CaseStudyDetail} />
            <Route path="/gallery" component={Gallery} />
            <Route path="/blog" component={Blog} />
            <Route path="/blog/:slug" component={BlogPost} />
            <Route path="/resume" component={Resume} />
            <Route path="/contact" component={Contact} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
